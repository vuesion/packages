import { Command, ICommandHandler } from '../decorators/command';
import { run } from '../scripts/extract-i18n-messages';
import { logError } from '@vuesion/utils/dist/ui';

@Command({
  name: 'extract-i18n-messages',
  alias: 'em',
  description: 'Extract i18n default messages from .vue files.',
  options: [
    { flags: '-s, --sort', description: 'Sort translation keys', defaultValue: false },
    { flags: '-u, --update', description: 'Update translations for default locale', defaultValue: false },
  ],
})
export class ExtractMessages implements ICommandHandler {
  public sort: boolean;
  public update: boolean;

  public run() {
    try {
      run(this.sort, this.update);
    } catch (e) {
      logError(e);
    }
  }
}
