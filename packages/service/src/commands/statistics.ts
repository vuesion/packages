import { Command, ICommandHandler } from '../lib/command';
import { filter, where, equals } from 'ramda';
import * as fs from 'fs';
import { packageRoot } from '../utils/path';
import { logErrorBold } from '../utils/ui';

const spawn = require('cross-spawn');
const opn = require('opn');

interface IStat {
  hash: string;
  message: string;
  author: string;
  date: string;
  type: string;
  release: boolean;
}

const getDate = (date: string) => {
  const newDate = new Date(date);

  newDate.setHours(newDate.getHours() + 1);
  newDate.setMinutes(newDate.getMinutes() + 4);

  return newDate
    .toISOString()
    .slice(0, 10)
    .replace('T', ' ');
};

const getType = (message: string) => {
  const type = message.split(':');
  return type.length === 1 ? 'feat' : type[0].trim().replace(/\(.*\)/g, '');
};

const reportTemplate = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Report</title>
</head>

<body>
  <canvas id="myChart" width="100%" height="50%"></canvas>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.24.0/moment.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.7.3/Chart.min.js"></script>
  <script>
  var ctx = document.getElementById("myChart").getContext("2d")
  var myChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: <dates>,
      datasets: <report>
    },
			options: {
        animation: {
            duration: 0, // general animation time
        },
        hover: {
            animationDuration: 0, // duration of animations when hovering an item
        },
        responsiveAnimationDuration: 0,
				scales: {
					xAxes: [{
						type: 'time',
						distribution: 'series',
						ticks: {
							source: 'labels'
						}
					}],
					yAxes: [{
					  stacked: true,
					}]
				},
        elements: {
            line: {
                tension: 0
            }
        }
			}
  });
  </script>
</body>
</html>`;

const getColor = (type: string) => {
  const colors = {
    build: '#845EC2',
    ci: '#f9d10f',
    docs: '#005d50',
    feat: '#00f401',
    fix: '#ff4f56',
    perf: '#00fea9',
    refactor: '#ff90dd',
    style: '#ffa238',
    test: '#009735',
    chore: '#626262',
    numberOfCommits: '#549dd8',
    numberOfReleases: '#192633',
  };
  return colors[type];
};

@Command({
  name: 'statistics',
  alias: 's',
  description: 'Generates a report for certain project management KPIs.',
})
export class Add implements ICommandHandler {
  public async run(args: string[]) {
    const childProcess: any = spawn('git', ['log', 'master', '--pretty=format:"%T|%s|%an|%cd"'], {});
    const stats: IStat[] = [];
    const types = [];
    const dates = [];
    const report: any = {};
    const reportPath = packageRoot('dist/report.html');

    childProcess.stdout.on('data', (data: any) => {
      data
        .toString()
        .split(/\r?\n/)
        .forEach((line) => {
          if (line.trim().length === 0) {
            return;
          }

          const [hash, message, author, date] = line.replace(/"/g, '').split('|');
          const type = getType(message);
          const formattedDate = getDate(date);
          const release = message.indexOf(':') === -1 && message.indexOf('.') > -1;

          stats.push({ hash, message, author, date: formattedDate, type, release });

          if (types.indexOf(type) === -1) {
            types.push(type);
          }
          if (dates.indexOf(formattedDate) === -1) {
            dates.push(formattedDate);
          }
        });
    });

    const chart = [];

    childProcess.on('exit', () => {
      dates.forEach((date: string) => {
        const statsForDate = filter(where({ date: equals(date) }), stats);
        const countPerType = {};
        const numberOfReleases: any = filter(where({ release: equals(true) }), statsForDate).length;
        let numberOfCommits = 0;

        types.forEach((type: string) => {
          const count = filter(where({ type: equals(type), release: equals(false) }), statsForDate).length;
          countPerType[type] = count;
          numberOfCommits += count;
        });

        report[date] = { ...countPerType, numberOfCommits, numberOfReleases };
      });

      [...types, 'numberOfCommits', 'numberOfReleases'].forEach((type: string) => {
        const color = getColor(type);
        const set = {
          label: type,
          backgroundColor: color,
          borderColor: color,
          data: [],
          fill: true,
        };

        dates.forEach((date: string) => {
          set.data.push(report[date][type]);
        });

        chart.push(set);
      });

      const file = reportTemplate.replace('<dates>', JSON.stringify(dates)).replace('<report>', JSON.stringify(chart));

      fs.writeFileSync(reportPath, file, 'utf-8');

      opn(reportPath, {
        wait: false,
      }).catch((err) => logErrorBold(err));
    });
  }
}
