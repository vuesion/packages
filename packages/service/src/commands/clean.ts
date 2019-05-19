import { Command, ICommandHandler, IRunOptions } from '../lib/command';
import { logError, Spinner } from '../utils/ui';
import { sync } from 'rimraf';
import { VuesionConfig } from '../models/VuesionConfig';

@Command({
  name: 'clean',
  description: 'Clean up the project directory.',
})
export class Clean implements ICommandHandler {
  public async run(args: string[], options: IRunOptions) {
    const spinner = new Spinner();

    spinner.message = 'Cleaning directories...';
    spinner.start(options.debug);

    try {
      VuesionConfig.clean.forEach((glob) => sync(glob));
      spinner.message = 'Directories cleaned';
      spinner.stop();
    } catch (e) {
      spinner.stop();
      logError(e);
    }
  }
}
