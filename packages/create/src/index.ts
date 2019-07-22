import * as commander from 'commander';
import { sync } from 'glob';
import * as fs from 'fs';
import * as path from 'path';
import { packagesRoot } from '../../utils/src';

sync(`${packagesRoot('create')}/src/commands/*.js`).forEach((file: string) => require(file));

const ServicePackage = JSON.parse(
  fs.readFileSync(path.join(packagesRoot('create'), '../..', 'package.json')).toString(),
);

commander
  .name('create-vuesion-app')
  .version(ServicePackage.version)
  .description(ServicePackage.description);

commander.parse(process.argv);
