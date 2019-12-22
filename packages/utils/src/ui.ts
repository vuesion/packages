/* tslint:disable:no-console */
import * as chalk from 'chalk';
import { format } from 'util';

export const log = (message) => console.log(chalk.white(message));
export const logInfo = (message) => console.log(chalk.blue(message));
export const logError = (message) => console.log(chalk.red(message));
export const logSuccess = (message) => console.log(chalk.green(message));
export const logWarning = (message) => console.log(chalk.yellow(message));

export const logBold = (message) => console.log(chalk.white.bold(message));
export const logInfoBold = (message) => console.log(chalk.blue.bold(message));
export const logErrorBold = (message) => console.log(chalk.red.bold(message));
export const logSuccessBold = (message) => console.log(chalk.green.bold(message));
export const logWarningBold = (message) => console.log(chalk.yellow.bold(message));

export const HeadLine = (message: string) => {
  logInfoBold(message);
};

export const Result = (message: string) => {
  logSuccessBold('✓ ' + message);
};

export class Spinner {
  private spinner: string[] = ['◜', '◠', '◝', '◞', '◡', '◟'];
  private timer = null;
  public message: string = '';

  public start = (debug: boolean = false) => {
    if (debug) {
      return;
    }

    const play = (arr: string[]) => {
      const len = arr.length;
      let i = 0;

      const drawTick = () => {
        const str = arr[i++ % len];
        process.stdout.write('\u001b[0G' + str + '\u001b[90m' + this.message + '\u001b[0m');
      };

      this.timer = setInterval(drawTick, 100);
    };

    const frames = this.spinner.map((c: string) => {
      return format('\u001b[96m%s ', c);
    });

    play(frames);
  };

  public stop = (err: boolean = false) => {
    if (err) {
      process.stdout.write('\u001b[0G\u001b[2K' + chalk.red(`✗ An error occurred.`));
    } else {
      process.stdout.write('\u001b[0G\u001b[2K' + chalk.green(`✓ ${this.message}`));
    }

    log('');
    log('');
    clearInterval(this.timer);
  };
}
