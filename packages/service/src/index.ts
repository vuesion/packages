import * as commander from 'commander';
import { sync } from 'glob';
import { packageRoot } from './utils/path';
import { TSConfig } from './models/TSConfig';
import { VuesionPackage } from './models/VuesionPackage';
import { ServicePackage } from './models/ServicePackage';

sync(`${packageRoot()}/dist/commands/*.js`).forEach((file: string) => require(file));

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
