import chalk from 'chalk';
import { Command, ICommandHandler, IRunOptions } from '../../../service/src/decorators/command';
import { handleProcessError, runProcess, runtimeRoot, Spinner } from '../../../utils/src';

const download = require('download-git-repo');

@Command({
  description: 'Create a new vuesion project.',
  arguments: [{ name: 'name', required: true }],
  options: [
    { flags: '-n, --next', description: 'Download latest version.', defaultValue: false },
    { flags: '-d, --debug', description: 'Show debugging output.', defaultValue: false },
  ],
})
export class Create implements ICommandHandler {
  private spinner = new Spinner();

  public name: string;
  public next: boolean;
  public debug: boolean;

  private download(branch, destination) {
    return new Promise((resolve, reject) => {
      download(branch, destination, async (e: any) => {
        if (e) {
          reject({ code: 1, trace: e.toString() });
        }
        resolve();
      });
    });
  }

  private async install(options) {
    this.spinner.message = 'Installing dependencies...';

    await runProcess('npm', ['install'], { silent: true, ...options });
  }

  private async postInstall(destination, options) {
    this.spinner.message = 'Running post-install...';

    await runProcess(
      destination + '/node_modules/.bin/vuesion',
      ['post-install', JSON.stringify({ name: this.name, branch: this.next ? 'next' : 'master' })],
      {
        silent: true,
        ...options,
      },
    );
  }

  public async run(args: string[], options: IRunOptions) {
    const destination = runtimeRoot(this.name);
    const branch = this.next ? 'github:vuesion/vuesion#next' : 'github:vuesion/vuesion';

    this.spinner.message = 'Downloading project...';
    this.spinner.start(options.debug);
    try {
      await this.download(branch, destination);

      process.chdir(destination);

      await this.install(options);
      await this.postInstall(destination, options);

      this.spinner.message = `Project ${chalk.bold(this.name)} successfully created`;
      this.spinner.stop();
    } catch (e) {
      handleProcessError(e, this.spinner);
    }
  }
}
