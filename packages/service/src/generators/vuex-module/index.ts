import * as path from 'path';
import { VuesionConfig } from '@vuesion/models';
import { runtimeRoot } from '@vuesion/utils/dist/path';
import { folderExists } from '@vuesion/utils/dist/fileSystem';
import { AppState } from '@vuesion/models';

const pluralize = require('pluralize');

export = {
  description: 'Add a new page',
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
  ],
  actions: (data: any) => {
    const filePath: string[] = data.name.split('/').filter((part: string) => part.trim().length > 0);
    const moduleName = filePath.pop();
    const singularName = moduleName.slice(-1).toLocaleLowerCase() === 's' ? moduleName.slice(0, -1) : moduleName;
    const pluralName = pluralize(singularName);

    data.moduleName = singularName;
    data.singularName = singularName;
    data.pluralName = pluralName;
    data.modulePath = filePath.join('/');
    data.componentName = data.singularName;
    data.basePath = path.join(process.cwd(), VuesionConfig.generators.outputDirectory, 'store', filePath.join('/'));
    data.outputDirectory = path.join(process.cwd(), VuesionConfig.generators.outputDirectory);
    data.wantRoutes = true;
    data.wantVuex = true;

    AppState.addModule(`${data.modulePath}/${data.singularName}`);

    return [
      {
        type: 'add',
        path: '{{basePath}}/{{camelCase singularName}}/actions.spec.ts',
        templateFile: path.join(
          process.cwd(),
          VuesionConfig.generators.blueprintDirectory,
          'vuex-module/actions.spec.ts.hbs',
        ),
        abortOnFail: true,
      },
      {
        type: 'add',
        path: '{{basePath}}/{{camelCase singularName}}/actions.ts',
        templateFile: path.join(
          process.cwd(),
          VuesionConfig.generators.blueprintDirectory,
          'vuex-module/actions.ts.hbs',
        ),
        abortOnFail: true,
      },
      {
        type: 'add',
        path: '{{basePath}}/{{camelCase singularName}}/getters.spec.ts',
        templateFile: path.join(
          process.cwd(),
          VuesionConfig.generators.blueprintDirectory,
          'vuex-module/getters.spec.ts.hbs',
        ),
        abortOnFail: true,
      },
      {
        type: 'add',
        path: '{{basePath}}/{{camelCase singularName}}/getters.ts',
        templateFile: path.join(
          process.cwd(),
          VuesionConfig.generators.blueprintDirectory,
          'vuex-module/getters.ts.hbs',
        ),
        abortOnFail: true,
      },
      {
        type: 'add',
        path: '{{basePath}}/{{camelCase singularName}}/mutations.spec.ts',
        templateFile: path.join(
          process.cwd(),
          VuesionConfig.generators.blueprintDirectory,
          'vuex-module/mutations.spec.ts.hbs',
        ),
        abortOnFail: true,
      },
      {
        type: 'add',
        path: '{{basePath}}/{{camelCase singularName}}/mutations.ts',
        templateFile: path.join(
          process.cwd(),
          VuesionConfig.generators.blueprintDirectory,
          'vuex-module/mutations.ts.hbs',
        ),
        abortOnFail: true,
      },
      {
        type: 'add',
        path: '{{basePath}}/{{camelCase singularName}}/state.ts',
        templateFile: path.join(process.cwd(), VuesionConfig.generators.blueprintDirectory, 'vuex-module/state.ts.hbs'),
        abortOnFail: true,
      },
      {
        type: 'add',
        path: '{{outputDirectory}}/interfaces/I{{properCase singularName}}.ts',
        templateFile: path.join(
          process.cwd(),
          VuesionConfig.generators.blueprintDirectory,
          'vuex-module/interface.ts.hbs',
        ),
        abortOnFail: true,
      },
    ];
  },
};
