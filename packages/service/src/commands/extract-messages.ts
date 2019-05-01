import { Command, ICommandHandler } from '../lib/command';
import { run } from '../scripts/extract-i18n-messages';
import { logError } from '../utils/ui';

@Command({
  name: 'extract-i18n-messages',
  alias: 'em',
  description: 'Extract i18n default messages from .vue files.',
})
export class ExtractMessages implements ICommandHandler {
  public run() {
    try {
      run();
    } catch (e) {
      logError(e);
    }
  }
}
