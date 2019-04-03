import { Command, ICommandHandler, IRunOptions } from '../lib/command';
import { handleProcessError } from '../utils/process';

const concurrently = require('concurrently');

@Command({
  name: 'parallel [commands...]',
  alias: 'p',
  description: 'Run commands in parallel.',
})
export class Add implements ICommandHandler {
  public async run(args: string[], options: IRunOptions) {
    concurrently(args).then(null, (e: any) => handleProcessError(e));
  }
}
