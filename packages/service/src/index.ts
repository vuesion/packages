import * as commander from 'commander';
import { Package } from './models/Package';
import { sync } from 'glob';
import { packageRoot } from './utils/path';
import { updateTsConfig } from './utils/misc';

sync(`${packageRoot()}/dist/commands/*.js`).forEach((file: string) => require(file));

commander
  .name('vuesion')
  .version(Package.version, '-v, --version')
  .option('-d, --debug', 'Show debugging output.', false)
  .description(Package.description);

/**
 * update tsconfig with latest aliases
 */
updateTsConfig();

commander.parse(process.argv);
