import { Command, ICommandHandler } from '../lib/command';
import { run } from '../scripts/update';
import { logError } from '../utils/ui';

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
