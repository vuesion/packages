import { Command, ICommandHandler } from '../decorators/command';
import { handleProcessError } from '@vuesion/utils/dist';

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
      handleProcessError({ code: 1, trace: 'Please see the console output above for a detailed error description.' });
    }
  }
}
