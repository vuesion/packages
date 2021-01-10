import * as path from 'path';
import * as glob from 'glob';
import { kebabCase } from 'lodash';
import { VuesionConfig } from '@vuesion/models';
import { getIntInRange } from '@vuesion/utils';

interface IInterfaceDefinition {
  id: string;
  type: string;
  isImported: boolean;
}

export = {
  description: 'Add a new interface and fixtures',
  prompts: [
    {
      type: 'input',
      name: 'name',
      message: 'What should it be called?',
      validate: (value: string) => {
        if (!value || value.length === 0) {
          return 'name is required';
        }

        return true;
      },
    },
    {
      type: 'input',
      name: 'definition',
      message: 'Please define your interface (e.g. name:string; age?:number; etc.)?',
      validate: (value: string) => {
        if (!value || value.length === 0) {
          return 'interface definition is required';
        }

        return true;
      },
    },
    {
      type: 'confirm',
      name: 'generateFixtures',
      default: true,
      message: 'Do you want to create a fixture for this interface?',
    },
    {
      type: 'input',
      name: 'numberOfFixtures',
      default: 3,
      message: 'How many fixture records do you want to have?',
      when: (data: any) => {
        return data.generateFixtures;
      },
    },
  ],
  actions: (data: any) => {
    const filePath: string[] = data.name.split('/');

    data.interfaceName = filePath.pop();
    data.interfacePath = path.join(
      process.cwd(),
      VuesionConfig.generators.outputDirectory,
      'interfaces',
      filePath.join('/'),
    );
    data.interfaceImportPath = `@/interfaces/${filePath.join('/')}/${data.interfaceName}`;
    data.interfaceImports = [];
    data.fixtureImports = [];
    data.interfaceDefinition = data.definition.split(/[,;]/).map(
      (definition: string): IInterfaceDefinition => {
        let [id, type] = definition.split(':');
        let isImported = false;

        id = id.trim();
        type = type.trim();

        if (type !== data.interfaceName) {
          const files = glob.sync(`./src/interfaces/**/${type}.ts`);
          isImported = files.length > 0;

          files.forEach((file) => {
            const interfacePath = `@${file.replace('./src', '')}`;
            const fixturePath = `@/fixtures${file.replace('./src/interfaces', '')}`;

            data.interfaceImports.push(`import { ${type} } from '${interfacePath}'`);
            data.fixtureImports.push(`import { ${type}Fixture } from '${fixturePath}'`);
          });
        }

        return { id, type, isImported };
      },
    );
    data.fixturePath = path.join(
      process.cwd(),
      VuesionConfig.generators.outputDirectory,
      'fixtures',
      filePath.join('/'),
    );
    data.fixtures = [];

    const actions: any[] = [
      {
        type: 'add',
        path: '{{interfacePath}}/{{properCase interfaceName}}.ts',
        templateFile: path.join(
          process.cwd(),
          VuesionConfig.generators.blueprintDirectory,
          'interface/interface.ts.hbs',
        ),
        abortOnFail: true,
        force: true,
      },
    ];

    if (data.generateFixtures) {
      const today = new Date();
      const max = parseInt(data.numberOfFixtures, 10);
      const maxDefinitions = data.interfaceDefinition.length;

      for (let i = 0; i < max; i++) {
        let fixture = '{';

        data.interfaceDefinition.forEach((item: IInterfaceDefinition, idx) => {
          const id = item.id.replace('?', '');
          fixture += ` ${id}:`;

          if (item.type.toLocaleLowerCase() === 'string') {
            fixture += ` '${kebabCase(id)}-${i + 1}'`;
          } else if (item.type.toLocaleLowerCase() === 'number') {
            fixture += ` ${getIntInRange(1, 100)}`;
          } else if (item.type.toLocaleLowerCase() === 'date') {
            fixture += ` new Date('${today.toJSON().slice(0, 10)}')`;
          } else if (item.type.toLocaleLowerCase() === 'boolean') {
            fixture += ` true`;
          } else if (item.isImported) {
            fixture += ` ${item.type}Fixture()`;
          } else {
            fixture += ` null`;
          }

          fixture += idx < maxDefinitions - 1 ? ',' : '';
        });

        fixture += ' }';

        data.fixtures.push(fixture);
      }

      actions.push({
        type: 'add',
        path: '{{fixturePath}}/{{properCase interfaceName}}.ts',
        templateFile: path.join(process.cwd(), VuesionConfig.generators.blueprintDirectory, 'interface/fixture.ts.hbs'),
        abortOnFail: true,
        force: true,
      });
    }

    return actions;
  },
};
