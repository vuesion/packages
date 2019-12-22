import { sync } from 'rimraf';
import { Command, ICommandHandler, IRunOptions } from '../decorators/command';
import { VuesionConfig, VuesionPackage } from '@vuesion/models/dist';
import { lowerCase, kebabCase } from 'lodash';

@Command({
  name: 'post-install',
  description: 'Separate steps that run after creating a new vuesion app.',
  arguments: [{ name: 'options', required: true }],
})
export class PostInstall implements ICommandHandler {
  private optionsObject: { name: string; branch: string };
  public options: string;

  private deleteDirectories() {
    [
      './.git',
      './.circleci',
      './.all-contributorsrc',
      './CHANGELOG.md',
      './CODE_OF_CONDUCT.md',
      './LICENSE',
    ].forEach((glob) => sync(glob));
  }

  private updateVuesionConfig() {
    VuesionConfig.updateCurrentVersion(`v${VuesionPackage.version}`);
  }

  private updateVuesionPackage() {
    VuesionPackage.name = kebabCase(lowerCase(this.optionsObject.name));
    VuesionPackage.version = '0.0.0';
    VuesionPackage.description = 'Created with vuesion.';
    VuesionPackage.repository = { type: '', url: '' };
    VuesionPackage.keywords = [];
    VuesionPackage.author = '';
    VuesionPackage.homepage = '';
    VuesionPackage.bugs = { url: '' };

    VuesionPackage.save(true);
  }

  public async run(args: string[], options: IRunOptions) {
    this.optionsObject = JSON.parse(this.options);

    this.deleteDirectories();
    this.updateVuesionConfig();
    this.updateVuesionPackage();
  }
}
