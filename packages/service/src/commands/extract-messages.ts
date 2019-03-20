import { Command, ICommandHandler, IRunOptions } from '../lib/command';
import { handleProcessError, runProcess } from '../utils/process';
import { packageRoot } from '../utils/path';

@Command({
  name: 'extract-i18n-messages',
  alias: 'em',
  description: 'Extract i18n default messages from .vue files.',
})
export class ExtractMessages implements ICommandHandler {
  public async run(args: string[], options: IRunOptions) {
    try {
      await runProcess('node', [packageRoot('dist/scripts/extract-i18n-messages.js')], options);
    } catch (e) {
      handleProcessError(e);
    }
  }
}
