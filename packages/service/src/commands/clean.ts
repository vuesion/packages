import { Command, ICommandHandler } from '../lib/command';
import { handleProcessError, runProcess } from '../utils/process';
import { Spinner } from '../utils/ui';
import { Config } from '../models/Config';

@Command({
  name: 'clean',
  description: 'Clean up the project directory.',
})
export class Clean implements ICommandHandler {
  public async run(args: string[], silent: boolean) {
    args = Config.clean.concat(args);
    const spinner = new Spinner();

    spinner.message = 'Cleaning directories...';

    try {
      await runProcess('rimraf', args, { silent });

      spinner.message = 'Directories cleaned';
      spinner.stop();
    } catch (e) {
      handleProcessError(e, spinner);
    }
  }
}
