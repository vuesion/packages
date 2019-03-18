import { Command, ICommandHandler, IRunOptions } from '../lib/command';
import { handleProcessError, runProcess } from '../utils/process';
import { packageRoot } from '../utils/path';
import { Config } from '../models/Config';

@Command({
  name: 'generate',
  alias: 'g',
  description: 'Generate Components, Connected Components or Modules.',
})
export class Generate implements ICommandHandler {
  public async run(args: string[], options: IRunOptions) {
    try {
      await runProcess('plop', ['--plopfile', packageRoot('dist/generators/index.js')], options);
      await runProcess('vuesion', ['prettier', '--pattern', `${Config.generators.outputDirectory}/**/*`], options);
    } catch (e) {
      handleProcessError(e);
    }
  }
}
