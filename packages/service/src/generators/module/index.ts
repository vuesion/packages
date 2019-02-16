import * as path from 'path';
import { addModuleToRouter, addModuleToState } from '../ast';
import { Config } from '../../models/Config';
import { folderExists, runtimeRoot } from '../../utils/path';

export = {
  description: 'Add a module with VueX store and routes',
  prompts: [
    {
      type: 'input',
      name: 'name',
      message: 'What should it be called?',
      validate: (value: string) => {
        if (!value || value.length === 0) {
          return 'name is required';
        }

        return folderExists(runtimeRoot(path.join(Config.generators.outputDirectory, value)))
          ? `folder already exists (${value})`
          : true;
      },
    },
    {
      type: 'confirm',
      name: 'wantRoutes',
      default: true,
      message: 'Do you want routes?',
    },
    {
      type: 'confirm',
      name: 'wantVuex',
      default: true,
      message: 'Do you want vuex?',
    },
  ],
  actions: (data: any) => {
    const filePath: string[] = data.name.split('/');

    data.moduleName = filePath.pop();
    data.componentName = data.moduleName;
    data.basePath = path.join(process.cwd(), Config.generators.outputDirectory, filePath.join('/'));

    let actions: any[] = [
      {
        type: 'add',
        path: '{{basePath}}/{{camelCase moduleName}}/{{properCase componentName}}/{{properCase componentName}}.vue',
        templateFile: path.join(process.cwd(), Config.generators.blueprintDirectory, 'connected/connected.vue.hbs'),
        abortOnFail: true,
      },
      {
        type: 'add',
        path: '{{basePath}}/{{camelCase moduleName}}/{{properCase componentName}}/{{properCase componentName}}.spec.ts',
        templateFile: path.join(process.cwd(), Config.generators.blueprintDirectory, 'connected/connected.spec.ts.hbs'),
        abortOnFail: true,
      },
    ];

    if (data.wantRoutes) {
      actions.push({
        type: 'add',
        path: '{{basePath}}/{{camelCase moduleName}}/routes.ts',
        templateFile: path.join(process.cwd(), Config.generators.blueprintDirectory, 'module/routes.ts.hbs'),
        abortOnFail: true,
      });

      addModuleToRouter(path.join(path.resolve(process.cwd()), Config.generators.routerFile), data.moduleName);
    }

    if (data.wantVuex) {
      actions = actions.concat([
        {
          type: 'add',
          path: '{{basePath}}/{{camelCase moduleName}}/actions.spec.ts',
          templateFile: path.join(process.cwd(), Config.generators.blueprintDirectory, 'module/actions.spec.ts.hbs'),
          abortOnFail: true,
        },
        {
          type: 'add',
          path: '{{basePath}}/{{camelCase moduleName}}/actions.ts',
          templateFile: path.join(process.cwd(), Config.generators.blueprintDirectory, 'module/actions.ts.hbs'),
          abortOnFail: true,
        },
        {
          type: 'add',
          path: '{{basePath}}/{{camelCase moduleName}}/getters.spec.ts',
          templateFile: path.join(process.cwd(), Config.generators.blueprintDirectory, 'module/getters.spec.ts.hbs'),
          abortOnFail: true,
        },
        {
          type: 'add',
          path: '{{basePath}}/{{camelCase moduleName}}/getters.ts',
          templateFile: path.join(process.cwd(), Config.generators.blueprintDirectory, 'module/getters.ts.hbs'),
          abortOnFail: true,
        },
        {
          type: 'add',
          path: '{{basePath}}/{{camelCase moduleName}}/module.ts',
          templateFile: path.join(process.cwd(), Config.generators.blueprintDirectory, 'module/module.ts.hbs'),
          abortOnFail: true,
        },
        {
          type: 'add',
          path: '{{basePath}}/{{camelCase moduleName}}/mutations.spec.ts',
          templateFile: path.join(process.cwd(), Config.generators.blueprintDirectory, 'module/mutations.spec.ts.hbs'),
          abortOnFail: true,
        },
        {
          type: 'add',
          path: '{{basePath}}/{{camelCase moduleName}}/mutations.ts',
          templateFile: path.join(process.cwd(), Config.generators.blueprintDirectory, 'module/mutations.ts.hbs'),
          abortOnFail: true,
        },
        {
          type: 'add',
          path: '{{basePath}}/{{camelCase moduleName}}/state.ts',
          templateFile: path.join(process.cwd(), Config.generators.blueprintDirectory, 'module/state.ts.hbs'),
          abortOnFail: true,
        },
      ]);

      addModuleToState(path.join(path.resolve(process.cwd()), Config.generators.stateFile), data.moduleName);
    }

    return actions;
  },
};
