import * as fs from 'fs';
import moduleGenerator = require('./module');
import crudModuleGenerator = require('./crud-module');
import componentGenerator = require('./component');
import connectedGenerator = require('./connected');

import { dashCase, snakeCase, constantCase } from './helpers';
import { runtimeRoot } from '@vuesion/utils/dist/path';

export = (plop: any) => {
  plop.setHelper('dashCase', dashCase);
  plop.setHelper('snakeCase', snakeCase);
  plop.setHelper('constantCase', constantCase);

  if (fs.existsSync(runtimeRoot('/.vuesion/generators/component'))) {
    plop.setGenerator('Simple Component', componentGenerator);
  }

  if (fs.existsSync(runtimeRoot('/.vuesion/generators/connected'))) {
    plop.setGenerator('Connected Component', connectedGenerator);
  }

  if (fs.existsSync(runtimeRoot('/.vuesion/generators/module'))) {
    plop.setGenerator('Empty Module', moduleGenerator);
  }

  if (fs.existsSync(runtimeRoot('/.vuesion/generators/crud-module'))) {
    plop.setGenerator('CRUD Module', crudModuleGenerator);
  }
};
