import { Command, ICommandHandler, IRunOptions } from '../lib/command';
import { handleProcessError, runProcess } from '../utils/process';
import { packageRoot } from '../utils/path';

@Command({
  name: 'update',
  alias: 'u',
  description: 'Update your local copy of vuesion.',
})
export class Update implements ICommandHandler {
  public async run(args: string[], options: IRunOptions) {
    try {
      await runProcess('node', [packageRoot('dist/scripts/update.js')], options);
      await runProcess('vuesion', ['prettier', '--pattern', '.vuesion/*.json'], { silent: true, ...options });
    } catch (e) {
      handleProcessError(e);
    }
  }
}
