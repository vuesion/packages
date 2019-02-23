import { Command, ICommandHandler } from '../lib/command';
import { handleProcessError, runProcess } from '../utils/process';
import { Spinner } from '../utils/ui';

@Command({
  name: 'parallel [commands...]',
  alias: 'p',
  description: 'Run commands in parallel.',
})
export class Add implements ICommandHandler {
  public async run(args: string[], silent: boolean) {
    const promises = [];
    const startTime: number = Date.now();
    const spinner = new Spinner();
    const max = args.length;
    let done = 0;

    const setSpinnerMessage = () => {
      if (done === 3) {
        spinner.message = `Finished running tasks in ${Date.now() - startTime}ms`;
      } else {
        spinner.message = `Running tasks ${done}/${max} ...`;
      }
    };

    spinner.start();
    setSpinnerMessage();

    args.forEach((command: string) => {
      const split = command.split(' ');
      promises.push(
        runProcess(split.shift(), split, { silent: true }).then(() => {
          done = done + 1;
          setSpinnerMessage();
        }),
      );
    });

    try {
      await Promise.all(promises);
      spinner.stop();
    } catch (e) {
      handleProcessError(e, spinner);
    }
  }
}
