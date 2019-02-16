import { Command, ICommandHandler } from '../lib/command';
import { handleProcessError, runProcess } from '../utils/process';
import { packageRoot } from '../utils/path';
import { Config } from '../models/Config';

@Command({
  name: 'generate',
  alias: 'g',
  description: 'Generate Components, Connected Components or Modules.',
})
export class Generate implements ICommandHandler {
  public async run(args: string[], silent: boolean) {
    try {
      await runProcess('plop', ['--plopfile', packageRoot('dist/generators/index.js')], { silent });

      await runProcess('vuesion', ['prettier', '--pattern', `${Config.generators.outputDirectory}/**/*`], {
        silent,
      });
    } catch (e) {
      handleProcessError(e);
    }
  }
}
