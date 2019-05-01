import { Command, ICommandHandler, IRunOptions } from '../lib/command';
import { packageRoot } from '../utils/path';
import { Config } from '../models/Config';
import { logError } from '../utils/ui';
import { runProcess } from '../utils/process';

@Command({
  name: 'generate',
  alias: 'g',
  description: 'Generate Components, Connected Components or Modules.',
})
export class Generate implements ICommandHandler {
  public async run(args: string[], options: IRunOptions) {
    try {
      process.argv = [process.argv[0], null, '--plopfile', packageRoot('dist/generators/index.js'), ...args];
      require('plop');

      await runProcess('vuesion', ['prettier', '--pattern', `${Config.generators.outputDirectory}/**/*`], options);
    } catch (e) {
      logError(e);
    }
  }
}
