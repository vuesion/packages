import * as path from 'path';
import { VuesionConfig } from '@vuesion/models';
import { runtimeRoot } from '@vuesion/utils/dist/path';
import { folderExists } from '@vuesion/utils/dist/fileSystem';
import { AppRouter, AppState } from '@vuesion/models';

const pluralize = require('pluralize');

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

        value = value.slice(-1).toLocaleLowerCase() === 's' ? value.slice(0, -1) : value;

        return folderExists(runtimeRoot(path.join(VuesionConfig.generators.outputDirectory, value)))
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
    const moduleName = filePath.pop();
    const singularName = moduleName.slice(-1).toLocaleLowerCase() === 's' ? moduleName.slice(0, -1) : moduleName;
    const pluralName = pluralize(singularName);

    data.moduleName = singularName;
    data.singularName = singularName;
    data.pluralName = pluralName;
    data.modulePath = filePath.join('/');
    data.componentName = data.singularName;
    data.basePath = path.join(process.cwd(), VuesionConfig.generators.outputDirectory, filePath.join('/'));

    let actions: any[] = [
      {
        type: 'add',
        path: '{{basePath}}/{{camelCase singularName}}/{{properCase componentName}}/{{properCase componentName}}.vue',
        templateFile: path.join(
          process.cwd(),
          VuesionConfig.generators.blueprintDirectory,
          'connected/connected.vue.hbs',
        ),
        abortOnFail: true,
      },
      {
        type: 'add',
        path:
          '{{basePath}}/{{camelCase singularName}}/{{properCase componentName}}/{{properCase componentName}}.spec.ts',
        templateFile: path.join(
          process.cwd(),
          VuesionConfig.generators.blueprintDirectory,
          'connected/connected.spec.ts.hbs',
        ),
        abortOnFail: true,
      },
    ];

    if (data.wantRoutes) {
      actions.push({
        type: 'add',
        path: '{{basePath}}/{{camelCase singularName}}/routes.ts',
        templateFile: path.join(process.cwd(), VuesionConfig.generators.blueprintDirectory, 'module/routes.ts.hbs'),
        abortOnFail: true,
      });

      AppRouter.addModule(`${data.modulePath}/${data.singularName}`);
    }

    if (data.wantVuex) {
      actions = actions.concat([
        {
          type: 'add',
          path: '{{basePath}}/{{camelCase singularName}}/actions.spec.ts',
          templateFile: path.join(
            process.cwd(),
            VuesionConfig.generators.blueprintDirectory,
            'module/actions.spec.ts.hbs',
          ),
          abortOnFail: true,
        },
        {
          type: 'add',
          path: '{{basePath}}/{{camelCase singularName}}/actions.ts',
          templateFile: path.join(process.cwd(), VuesionConfig.generators.blueprintDirectory, 'module/actions.ts.hbs'),
          abortOnFail: true,
        },
        {
          type: 'add',
          path: '{{basePath}}/{{camelCase singularName}}/getters.spec.ts',
          templateFile: path.join(
            process.cwd(),
            VuesionConfig.generators.blueprintDirectory,
            'module/getters.spec.ts.hbs',
          ),
          abortOnFail: true,
        },
        {
          type: 'add',
          path: '{{basePath}}/{{camelCase singularName}}/getters.ts',
          templateFile: path.join(process.cwd(), VuesionConfig.generators.blueprintDirectory, 'module/getters.ts.hbs'),
          abortOnFail: true,
        },
        {
          type: 'add',
          path: '{{basePath}}/{{camelCase singularName}}/module.ts',
          templateFile: path.join(process.cwd(), VuesionConfig.generators.blueprintDirectory, 'module/module.ts.hbs'),
          abortOnFail: true,
        },
        {
          type: 'add',
          path: '{{basePath}}/{{camelCase singularName}}/mutations.spec.ts',
          templateFile: path.join(
            process.cwd(),
            VuesionConfig.generators.blueprintDirectory,
            'module/mutations.spec.ts.hbs',
          ),
          abortOnFail: true,
        },
        {
          type: 'add',
          path: '{{basePath}}/{{camelCase singularName}}/mutations.ts',
          templateFile: path.join(
            process.cwd(),
            VuesionConfig.generators.blueprintDirectory,
            'module/mutations.ts.hbs',
          ),
          abortOnFail: true,
        },
        {
          type: 'add',
          path: '{{basePath}}/{{camelCase singularName}}/state.ts',
          templateFile: path.join(process.cwd(), VuesionConfig.generators.blueprintDirectory, 'module/state.ts.hbs'),
          abortOnFail: true,
        },
      ]);

      AppState.addModule(`${data.modulePath}/${data.singularName}`);
    }

    return actions;
  },
};
