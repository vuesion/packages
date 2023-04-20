import { program } from 'commander';
import { sync } from 'glob';
import * as fs from 'fs';
import * as path from 'path';
import { packagesRoot } from './utils';

sync(`${packagesRoot()}/dist/commands/*.js`).forEach((file: string) => {
  require(file);
});

const ServicePackage = JSON.parse(fs.readFileSync(path.join(packagesRoot(), 'package.json')).toString());

program.name('create-vuesion-app').version(ServicePackage.version).description(ServicePackage.description);

program.parse(process.argv);
