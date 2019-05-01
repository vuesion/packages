import { Command, ICommandHandler } from '../lib/command';
import { logError } from '../utils/ui';

const concurrently = require('concurrently');

@Command({
  name: 'parallel [commands...]',
  alias: 'p',
  description: 'Run commands in parallel.',
})
export class Add implements ICommandHandler {
  public async run(args: string[]) {
    try {
      await concurrently(args);
    } catch (e) {
      logError(e);
    }
  }
}
