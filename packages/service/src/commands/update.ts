import { Command, ICommandHandler } from '../decorators/command';
import { run } from '../scripts/update';
import { logError } from '@vuesion/utils/dist/ui';

@Command({
  name: 'update',
  alias: 'u',
  description: 'Update your local copy of vuesion.',
})
export class Update implements ICommandHandler {
  public async run() {
    try {
      await run();
    } catch (e) {
      logError(e);
    }
  }
}
