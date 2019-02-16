import * as fs from 'fs-extra';
import chalk from 'chalk';
import { Command, ICommandHandler } from '../lib/command';
import { prompt, Question } from 'inquirer';
import { logErrorBold, Spinner } from '../utils/ui';
import { handleProcessError, runProcess } from '../utils/process';
import { runtimeRoot } from '../utils/path';
const opn = require('opn');

@Command({
  name: 'add',
  alias: 'a',
  description: 'Add a vue-starter package to your project.',
})
export class Add implements ICommandHandler {
  private questions: Question[] = [
    {
      type: 'list',
      name: 'package',
      message: 'Which package do you want to add to your project?',
      choices: ['vue-starter-contentful'],
    },
  ];

  public async run(args: string[], silent: boolean) {
    let result: any = await prompt(this.questions);
    const packageName = result.package;
    const source = runtimeRoot(`node_modules/${packageName}/template`);
    const destination = runtimeRoot();
    const spinner = new Spinner();

    spinner.message = `Installing ${chalk.bold(packageName)} into your project...`;
    spinner.start();

    try {
      await runProcess('npm', ['install', '--save', packageName], { silent: true });
    } catch (e) {
      spinner.stop();
      handleProcessError(e);
    }

    if (fs.existsSync(source)) {
      fs.copy(source, destination, async (e) => {
        if (e) {
          spinner.stop();
          logErrorBold(e);
        } else {
          spinner.message = `Package ${chalk.bold(packageName)} successfully installed`;
          spinner.stop();

          this.questions = [
            {
              type: 'confirm',
              name: 'open',
              message: 'Do you want to open the package documentation?',
              default: true,
            },
          ];

          result = await prompt(this.questions);

          if (result.open) {
            try {
              await opn(`https://github.com/devCrossNet/vue-starter-packages/tree/master/packages/${packageName}`, {
                wait: false,
              });
            } catch (e) {
              logErrorBold(e);
            }
          }
        }
      });
    }
  }
}
