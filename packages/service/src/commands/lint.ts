import { Command, ICommandHandler, IRunOptions } from '../lib/command';
import { handleProcessError } from '../utils/process';
import { Spinner } from '../utils/ui';

@Command({
  name: 'lint',
  alias: 'l',
  description: 'Lint project files.',
})
export class Lint implements ICommandHandler {
  public async run(args: string[], options: IRunOptions) {
    const spinner = new Spinner();

    spinner.message = 'Linting files...';
    spinner.start(options.debug);

    process.argv = [process.argv[0], null, '--fix', '-c', 'tslint.json', '-p', 'tsconfig.json', ...args];

    try {
      require('tslint/lib/tslintCli.js');

      spinner.message = 'All files passed linting';
      spinner.stop();
    } catch (e) {
      handleProcessError(e, spinner);
    }
  }
}
