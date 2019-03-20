import { Command, ICommandHandler, IRunOptions } from '../lib/command';
import { handleProcessError, runProcess } from '../utils/process';

@Command({
  name: 'storybook',
  description: 'Run Storybook.',
  options: [{ flags: '-d, --dev', description: 'Run Storybook in development mode.' }],
})
export class Storybook implements ICommandHandler {
  public dev: boolean;

  public async run(args: string[], options: IRunOptions) {
    const dev = Boolean(this.dev);
    let binary = 'build-storybook';

    if (dev) {
      binary = 'start-storybook';

      args.pop();
      args = args.concat(['-p', '6006']);
    } else {
      args = args.concat(['--output-dir', './storybook-static']);
    }

    args = args.concat(['--config-dir', './.vuesion//storybook']);

    args = args.filter((arg: string) => arg !== '--silent');

    try {
      await runProcess(binary, args, options);
    } catch (e) {
      handleProcessError(e);
    }
  }
}
