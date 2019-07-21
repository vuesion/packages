import * as commander from 'commander';
import { sync } from 'glob';
import { packagesRoot } from '@vuesion/utils/dist/path';
import { TSConfig } from '@vuesion/models';
import { VuesionPackage, ServicePackage } from '@vuesion/models';

sync(`${packagesRoot('service')}/dist/commands/*.js`).forEach((file: string) => require(file));

commander.name('vuesion').option('-d, --debug', 'Show debugging output.', false);

/**
 * not available during npx execution
 */
if (ServicePackage) {
  commander.version(ServicePackage.version, '-v, --version').description(ServicePackage.description);
  /**
   * update tsconfig with latest aliases
   */
  TSConfig.updateCompilerOptionsPaths();
  VuesionPackage.updateModuleNameMapper();
}

commander.parse(process.argv);
