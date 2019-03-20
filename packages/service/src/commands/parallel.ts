import { Command, ICommandHandler, IRunOptions } from '../lib/command';
import { handleProcessError, runProcess } from '../utils/process';
import { Spinner } from '../utils/ui';

@Command({
  name: 'parallel [commands...]',
  alias: 'p',
  description: 'Run commands in parallel.',
})
export class Add implements ICommandHandler {
  private promises = [];
  private startTime = Date.now();
  private spinner = new Spinner();
  private max = 0;
  private done = 0;

  private setSpinnerMessage() {
    if (this.done === this.max) {
      this.spinner.message = `Finished running tasks in ${Date.now() - this.startTime}ms`;
    } else {
      this.spinner.message = `Running tasks ${this.done}/${this.max} ...`;
    }
  }

  public async run(args: string[], options: IRunOptions) {
    this.max = args.length;
    this.done = 0;

    this.spinner.start(options.debug);
    this.setSpinnerMessage();

    args.forEach((command: string) => {
      const split = command.split(' ');
      this.promises.push(
        runProcess(split.shift(), split, { silent: true, ...options }).then(() => {
          this.done = this.done + 1;
          this.setSpinnerMessage();
        }),
      );
    });

    try {
      await Promise.all(this.promises);
      this.spinner.stop();
    } catch (e) {
      handleProcessError(e, this.spinner);
    }
  }
}
