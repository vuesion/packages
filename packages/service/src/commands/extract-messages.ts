import { Command, ICommandHandler } from '../lib/command';
import { handleProcessError, runProcess } from '../utils/process';
import { packageRoot } from '../utils/path';

@Command({
  name: 'extract-i18n-messages',
  alias: 'em',
  description: 'Extract i18n default messages from .vue files.',
})
export class ExtractMessages implements ICommandHandler {
  public async run(args: string[], silent: boolean) {
    try {
      await runProcess('node', [packageRoot('dist/scripts/extract-i18n-messages.js')], { silent });
    } catch (e) {
      handleProcessError(e);
    }
  }
}
