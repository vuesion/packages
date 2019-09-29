import * as path from 'path';
import { VuesionConfig } from '@vuesion/models';
import { runtimeRoot } from '@vuesion/utils/dist/path';
import { folderExists } from '@vuesion/utils/dist/fileSystem';

const pluralize = require('pluralize');

export = {
  description: 'Add a VueX connected component',
  prompts: [
    {
      type: 'input',
      name: 'name',
      message: 'What should it be called?',
      validate: (value: string) => {
        if (!value || value.length === 0) {
          return 'name is required';
        }

        if (value.indexOf('/') === -1) {
          return 'a connected component has to live in a module';
        }

        return folderExists(runtimeRoot(path.join(VuesionConfig.generators.outputDirectory, value)))
          ? `folder already exists (${value})`
          : true;
      },
    },
  ],
  actions: (data: any) => {
    const filePath: string[] = data.name.split('/');
    const componentName = filePath.pop();
    const moduleName = filePath.pop();
    const singularName = moduleName.slice(-1).toLocaleLowerCase() === 's' ? moduleName.slice(0, -1) : moduleName;
    const pluralName = pluralize(singularName);

    data.moduleName = singularName;
    data.singularName = singularName;
    data.pluralName = pluralName;
    data.modulePath = filePath.join('/');

    data.componentName = componentName;
    data.basePath = path.join(process.cwd(), VuesionConfig.generators.outputDirectory, filePath.join('/'));
    data.wantVuex = true;

    return [
      {
        type: 'add',
        path: '{{basePath}}/{{camelCase moduleName}}/{{properCase componentName}}/{{properCase componentName}}.vue',
        templateFile: path.join(
          process.cwd(),
          VuesionConfig.generators.blueprintDirectory,
          'connected/connected.vue.hbs',
        ),
        abortOnFail: true,
      },
      {
        type: 'add',
        path: '{{basePath}}/{{camelCase moduleName}}/{{properCase componentName}}/{{properCase componentName}}.spec.ts',
        templateFile: path.join(
          process.cwd(),
          VuesionConfig.generators.blueprintDirectory,
          'connected/connected.spec.ts.hbs',
        ),
        abortOnFail: true,
      },
    ];
  },
};
