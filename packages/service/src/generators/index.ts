import * as fs from 'fs';
import componentGenerator = require('./component');
import pageGenerator = require('./page');
import vuexModuleGenerator = require('./vuex-module');
import interfaceGenerator = require('./interface');
import { dashCase, snakeCase, constantCase } from './helpers';
import { runtimeRoot } from '@vuesion/utils/dist/path';

export = (plop: any) => {
  plop.setHelper('dashCase', dashCase);
  plop.setHelper('snakeCase', snakeCase);
  plop.setHelper('constantCase', constantCase);

  if (fs.existsSync(runtimeRoot('/.vuesion/generators/component'))) {
    plop.setGenerator('Simple Component', componentGenerator);
  }

  if (fs.existsSync(runtimeRoot('/.vuesion/generators/page'))) {
    plop.setGenerator('Page', pageGenerator);
  }

  if (fs.existsSync(runtimeRoot('/.vuesion/generators/vuex-module'))) {
    plop.setGenerator('Vuex Module', vuexModuleGenerator);
  }

  if (fs.existsSync(runtimeRoot('/.vuesion/generators/interface'))) {
    plop.setGenerator('Interface', interfaceGenerator);
  }
};
