import { Command, ICommandHandler } from '../lib/command';
import { handleProcessError, runProcess } from '../utils/process';

@Command({
  name: 'storybook',
  description: 'Run Storybook.',
  options: [{ flags: '-d, --dev', description: 'Run Storybook in development mode.' }],
})
export class Storybook implements ICommandHandler {
  public dev: boolean;

  public async run(args: string[], silent: boolean) {
    const dev = Boolean(this.dev);
    let binary = 'build-storybook';

    if (dev) {
      binary = 'start-storybook';

      args.pop();
      args = args.concat(['-p', '6006']);
    } else {
      args = args.concat(['--output-dir', './storybook-static']);
    }

    args = args.concat(['--config-dir', './.vue-starter/storybook']);

    args = args.filter((arg: string) => arg !== '--silent');

    try {
      await runProcess(binary, args, { silent });
    } catch (e) {
      handleProcessError(e);
    }
  }
}
