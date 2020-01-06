import { Command, ICommandHandler } from '../decorators/command';
import { run } from '../scripts/update';
import { logError } from '@vuesion/utils/dist/ui';

@Command({
  name: 'update',
  alias: 'u',
  description: 'Update your local copy of vuesion.',
  options: [{ flags: '-n, --next', description: 'update to the latest version', defaultValue: false }],
})
export class Update implements ICommandHandler {
  public next: boolean;

  public async run() {
    try {
      await run(this.next);
    } catch (e) {
      logError(e);
    }
  }
}
