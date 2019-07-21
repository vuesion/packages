import * as commander from 'commander';
import { sync } from 'glob';
import { packagesRoot } from '@vuesion/utils/dist/path';
import { TSConfig, VuesionPackage, ServicePackage } from '@vuesion/models';
import * as path from 'path';

sync(`${packagesRoot('service')}/dist/commands/*.js`).forEach((file: string) => require(file));

ServicePackage.load(path.join(__dirname, '../package.json'));

commander
  .name('vuesion')
  .version(ServicePackage.version, '-v, --version')
  .option('-d, --debug', 'Show debugging output.', false)
  .description(ServicePackage.description);

/**
 * update tsconfig with latest aliases
 */
TSConfig.updateCompilerOptionsPaths();
VuesionPackage.updateModuleNameMapper();

commander.parse(process.argv);
