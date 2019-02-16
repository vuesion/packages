import * as commander from 'commander';
import { Package } from './models/Package';
import { sync } from 'glob';
import { packageRoot } from './utils/path';

sync(`${packageRoot()}/dist/commands/*.js`).forEach((file: string) => require(file));

commander
  .name('vuesion')
  .version(Package.version, '-v, --version')
  .option('-s, --silent', 'silence output.', false)
  .description(Package.description);

commander.parse(process.argv);
