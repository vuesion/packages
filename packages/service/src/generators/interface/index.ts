import * as path from 'path';
import * as glob from 'glob';
import { kebabCase } from 'lodash';
import { VuesionConfig } from '@vuesion/models';
import { getIntInRange } from '@vuesion/utils';

interface IInterfaceDefinition {
  id: string;
  type: string;
  plainType: string;
  isImported: boolean;
  isArray: boolean;
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
    data.interfaceImportPath = `@/interfaces/${filePath.length > 0 ? filePath.join('/') + '/' : ''}${
      data.interfaceName
    }`;
    data.interfaceImports = [];
    data.fixtureImports = [];
    data.interfaceDefinition = data.definition
      .replace(/(^,)|(,$)/g, '')
      .replace(/(^;)|(;$)/g, '')
      .split(/[,;]/)
      .map(
        (definition: string): IInterfaceDefinition => {
          let [id, type] = definition.split(':');

          id = id.trim();
          type = type.trim();

          let isImported = false;
          const isArray = type.indexOf('[]') > -1 || type.indexOf('Array') > -1;
          const plainType = type.replace('[]', '').replace('Array', '').replace('<', '').replace('>', '');

          if (type !== data.interfaceName) {
            const files = glob.sync(`./src/interfaces/**/${plainType}.ts`);
            isImported = files.length > 0;

            files.forEach((file) => {
              const interfacePath = `@${file.replace('./src', '')}`;
              const fixturePath = `@/fixtures${file.replace('./src/interfaces', '')}`;
              const interfaceImport = `import { ${plainType} } from '${interfacePath}'`;
              const fixtureImport = `import { ${plainType}CollectionFixture, ${plainType}Fixture } from '${fixturePath}'`;

              if (data.interfaceImports.indexOf(interfaceImport) === -1) {
                data.interfaceImports.push(interfaceImport);
              }

              if (data.fixtureImports.indexOf(fixtureImport) === -1) {
                data.fixtureImports.push(fixtureImport);
              }
            });
          }

          return { id, type, isImported, isArray, plainType };
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
          fixture += ` ${id}: `;

          if (item.isArray && !item.isImported) {
            fixture += '[';
          }

          if (item.plainType.toLocaleLowerCase() === 'string') {
            fixture += `'${kebabCase(id)}-${i + 1}'`;
          } else if (item.plainType.toLocaleLowerCase() === 'number') {
            fixture += `${getIntInRange(1, 100)}`;
          } else if (item.plainType.toLocaleLowerCase() === 'date') {
            fixture += `new Date('${today.toJSON().slice(0, 10)}')`;
          } else if (item.plainType.toLocaleLowerCase() === 'boolean') {
            fixture += `true`;
          } else if (item.isImported) {
            fixture += item.isArray ? `${item.plainType}CollectionFixture()` : `${item.plainType}Fixture()`;
          } else {
            fixture += `null`;
          }

          if (item.isArray && !item.isImported) {
            fixture += ']';
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
