import { Command, ICommandHandler, IRunOptions } from '../decorators/command';
import { handleProcessError } from '@vuesion/utils/dist/process';
import { logInfo, logSuccessBold } from '@vuesion/utils/dist/ui';

@Command({
  name: 'lint',
  alias: 'l',
  description: 'Lint project files.',
})
export class Lint implements ICommandHandler {
  public async run(args: string[], options: IRunOptions) {
    const cli = require('eslint/lib/cli');

    logInfo('Linting files...');

    process.argv = [process.argv[0], null, '.', '--ext', 'ts,vue', '--fix', ...args];

    if (options.debug) {
      process.argv.push('--debug');
    }

    const exitCode = cli.execute(process.argv);

    if (exitCode === 0) {
      logSuccessBold('✓ All files passed linting');
    } else {
      handleProcessError({ code: exitCode, trace: null });
    }
  }
}
