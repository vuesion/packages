import { Command, ICommandHandler, IRunOptions } from '../decorators/command';
import { Spinner } from '@vuesion/utils/dist/ui';
import { runtimeRoot } from '@vuesion/utils/dist/path';
import { handleProcessError, runProcess } from '@vuesion/utils/dist/process';
import chalk from 'chalk';

const download = require('download-git-repo');

@Command({
  name: 'create',
  alias: 'c',
  description: 'Create a new vuesion project.',
  arguments: [{ name: 'name', defaultValue: 'my-app' }],
  options: [{ flags: '-n, --next', description: 'Download latest version.' }],
})
export class Create implements ICommandHandler {
  public name: string;
  public next: boolean;

  public async run(args: string[], options: IRunOptions) {
    const destination = runtimeRoot(this.name);
    const branch = this.next ? 'github:vuesion/vuesion#next' : 'github:vuesion/vuesion';
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
