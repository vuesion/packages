import * as path from 'path';
import { VuesionConfig } from '../../models/VuesionConfig';
import { folderExists, runtimeRoot } from '../../utils/path';

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

    data.componentName = filePath.pop();
    data.moduleName = filePath.pop();
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
