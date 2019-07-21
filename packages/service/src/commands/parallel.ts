import { Command, ICommandHandler } from '../decorators/command';
import { logError } from '@vuesion/utils/dist/ui';

const concurrently = require('concurrently');

@Command({
  name: 'parallel [commands...]',
  alias: 'p',
  description: 'Run commands in parallel.',
})
export class Add implements ICommandHandler {
  public async run(args: string[]) {
    try {
      await concurrently(args, { killOthers: ['failure'], prefix: '[{command}]', prefixLength: 28 });
    } catch (e) {
      logError(e);
    }
  }
}
