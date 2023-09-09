import { Command, ICommandHandler, IRunOptions } from '../decorators/command';
import { handleProcessError, runProcess, runtimeRoot, Spinner } from '../utils';
import { lowerCase, kebabCase } from 'lodash';
import { PackageJson } from '../models/PackageJson';
import * as path from 'path';

const clc = require('cli-color');
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
        resolve(null);
      });
    });
  }

  private async install(options) {
    this.spinner.message = 'Installing dependencies...';

    await runProcess('npm', ['install'], { silent: true, ...options });
  }

  private async postInstall(destination, options) {
    this.spinner.message = 'Running post-install...';

    const packageJson = new PackageJson(path.join(destination, 'package.json'));

    packageJson.name = this.name;
    packageJson.version = '0.0.1';
    packageJson.description = 'This Project is powered by vuesion.';
    packageJson.repository = { type: '', url: '' };
    packageJson.keywords = [];
    packageJson.author = '';
    packageJson.homepage = '';
    packageJson.bugs = { url: '' };

    packageJson.save(true);
  }

  public async run(args: string[], options: IRunOptions) {
    this.name = kebabCase(lowerCase(this.name));

    const destination = runtimeRoot(this.name);
    let branch = 'github:vuesion/vuesion#main';

    if (this.next) {
      branch = 'github:vuesion/vuesion#next';
    }

    this.spinner.message = 'Downloading project...';
    this.spinner.start(options.debug);
    try {
      await this.download(branch, destination);

      process.chdir(destination);
    } catch (e) {
      handleProcessError(e, this.spinner);
    }

    try {
      await this.install(options);
    } catch (e) {
      this.spinner.message = '';
    }

    try {
      await this.postInstall(destination, options);
    } catch (e) {
      this.spinner.message = '';
    }

    this.spinner.message = `Project ${clc.bold(this.name)} successfully created`;
    this.spinner.stop();
  }
}
