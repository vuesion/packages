import { Command, ICommandHandler } from '../lib/command';
import { handleProcessError, runProcess } from '../utils/process';
import { packageRoot } from '../utils/path';

@Command({
  name: 'update',
  alias: 'u',
  description: 'Update your local copy of the vue-starter.',
})
export class Update implements ICommandHandler {
  public async run(args: string[], silent: boolean) {
    try {
      await runProcess('node', [packageRoot('dist/scripts/update.js')], { silent });

      await runProcess('vue-starter-service', ['prettier', '--pattern', '.vue-starter/*.json'], {
        silent,
      });
    } catch (e) {
      handleProcessError(e);
    }
  }
}
