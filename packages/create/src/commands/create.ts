import { Command, ICommandHandler, IRunOptions } from '../../../service/src/decorators/command';
import chalk from 'chalk';
import { handleProcessError, runProcess, runtimeRoot, Spinner } from '../../../utils/src';

const download = require('download-git-repo');

@Command({
  description: 'Create a new vuesion project.',
  arguments: [{ name: 'name', required: true }],
  options: [
    { flags: '-n, --next', description: 'Download latest version.' },
    { flags: '-d, --debug', description: 'Show debugging output.', defaultValue: false },
  ],
})
export class Create implements ICommandHandler {
  public name: string;
  public next: boolean;
  public debug: boolean;

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
