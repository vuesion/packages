import { sync } from 'rimraf';
import { Command, ICommandHandler, IRunOptions } from '../decorators/command';
import { VuesionConfig, VuesionPackage } from '@vuesion/models/dist';

@Command({
  name: 'post-install',
  description: 'Separate steps that run after creating a new vuesion app.',
  arguments: [{ name: 'options', required: true }],
})
export class PostInstall implements ICommandHandler {
  private optionsObject: { name: string; branch: string };
  public options: string;

  public async run(args: string[], options: IRunOptions) {
    this.optionsObject = JSON.parse(this.options);

    /**
     * Delete directories that are not important for the general public
     */
    ['./.git', './.circleci', './.all-contributorsrc', './CHANGELOG.md', './CODE_OF_CONDUCT.md', './LICENSE'].forEach(
      (glob) => sync(glob),
    );

    /**
     * update vuesion config
     */
    VuesionConfig.updateCurrentVersion(`v${VuesionPackage.version}`);

    /**
     * Update package.json
     */
    VuesionPackage.name = this.optionsObject.name;
    VuesionPackage.version = '0.0.0';
    VuesionPackage.description = 'Created with vuesion.';
    VuesionPackage.repository = { type: '', url: '' };
    VuesionPackage.keywords = [];
    VuesionPackage.author = '';
    VuesionPackage.homepage = '';
    VuesionPackage.bugs = { url: '' };

    VuesionPackage.save(true);
  }
}
