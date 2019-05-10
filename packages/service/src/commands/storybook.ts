import { Command, ICommandHandler } from '../lib/command';

@Command({
  name: 'storybook',
  description: 'Run Storybook.',
  options: [{ flags: '-d, --dev', description: 'Run Storybook in development mode.' }],
})
export class Storybook implements ICommandHandler {
  public dev: boolean;

  public async run(args: string[]) {
    const dev = Boolean(this.dev);

    process.argv = process.argv.concat([
      '-p',
      '6006',
      '--output-dir',
      './storybook-static',
      '--config-dir',
      './.vuesion/storybook',
      ...args,
    ]);

    if (dev) {
      require('@storybook/vue/bin/index.js');
    } else {
      require('@storybook/vue/bin/build.js');
    }
  }
}
