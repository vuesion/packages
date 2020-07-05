import * as path from 'path';
import { VuesionConfig } from '@vuesion/models';
import { runtimeRoot } from '@vuesion/utils/dist/path';
import { folderExists } from '@vuesion/utils/dist/fileSystem';

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
    const filePath: string[] = data.name.split('/');
    const moduleName = filePath.pop();
    const singularName = moduleName.slice(-1).toLocaleLowerCase() === 's' ? moduleName.slice(0, -1) : moduleName;
    const pluralName = pluralize(singularName);

    data.moduleName = singularName;
    data.singularName = singularName;
    data.pluralName = pluralName;
    data.modulePath = filePath.join('/');
    data.componentName = data.singularName;
    data.basePath = path.join(process.cwd(), VuesionConfig.generators.outputDirectory);
    data.filePath = filePath.join('/');

    return [
      {
        type: 'add',
        path: '{{basePath}}/pages/{{filePath}}/{{dashCase componentName}}.vue',
        templateFile: path.join(process.cwd(), VuesionConfig.generators.blueprintDirectory, 'page/page.vue.hbs'),
        abortOnFail: true,
      },
      {
        type: 'add',
        path: '{{basePath}}/pages/{{filePath}}/{{dashCase componentName}}.spec.ts',
        templateFile: path.join(process.cwd(), VuesionConfig.generators.blueprintDirectory, 'page/page.spec.ts.hbs'),
        abortOnFail: true,
      },
    ];
  },
};
