import * as commander from 'commander';
import { sync } from 'glob';
import { packagesRoot } from '@vuesion/utils/dist/path';
import { ServicePackage } from '@vuesion/models';

sync(`${packagesRoot('service')}/dist/commands/*.js`).forEach((file: string) => require(file));

commander
  .name('vuesion')
  .version(ServicePackage.version, '-v, --version')
  .helpOption('-h, --help', 'Output usage information.')
  .option('-d, --debug', 'Show debugging output.', false)
  .description(ServicePackage.description);

commander.parse(process.argv);
