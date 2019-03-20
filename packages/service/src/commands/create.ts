import { Command, ICommandHandler, IRunOptions } from '../lib/command';
import { Spinner } from '../utils/ui';
import { runtimeRoot } from '../utils/path';
import { handleProcessError, runProcess } from '../utils/process';
import chalk from 'chalk';

const download = require('download-git-repo');

@Command({
  name: 'create',
  alias: 'c',
  description: 'Create a new vue-starter project.',
  arguments: [{ name: 'name', defaultValue: 'my-app' }],
  options: [{ flags: '-n, --next', description: 'Download latest version.' }],
})
export class Create implements ICommandHandler {
  public name: string;
  public next: string;

  public async run(args: string[], options: IRunOptions) {
    const destination = runtimeRoot(this.name);
    const branch = this.next ? 'github:devCrossNet/vue-starter#next' : 'github:devCrossNet/vue-starter';
    const spinner = new Spinner();

    spinner.message = 'Downloading project...';
    spinner.start(options.debug);

    download(branch, destination, async (e: any) => {
      if (e) {
        handleProcessError({ code: 1, trace: e.toString() }, spinner);
      }

      spinner.message = 'Installing dependencies...';

      try {
        await runProcess('npm', ['install'], { cwd: destination, silent: true, ...options });

        spinner.message = `Project ${chalk.bold(this.name)} successfully created`;
        spinner.stop();
      } catch (err) {
        handleProcessError(e, spinner);
      }
    });
  }
}
