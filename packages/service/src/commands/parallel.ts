import { Command, ICommandHandler } from '../lib/command';
import { runProcess } from '../utils/process';

@Command({
  name: 'parallel [commands...]',
  alias: 'p',
  description: 'Run commands in parallel.',
})
export class Add implements ICommandHandler {
  public async run(args: string[], silent: boolean) {
    const promises = [];

    args.forEach((command: string) => {
      const split = command.split(' ');
      promises.push(runProcess(split.shift(), split));
    });
  }
}
