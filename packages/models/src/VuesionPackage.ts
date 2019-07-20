import { JSONModel } from './JSONModel';
import { runtimeRoot } from '@vuesion/utils';
import { VuesionConfig } from './VuesionConfig';

interface IVuesionPackage extends Object {
  jest: { moduleNameMapper: any };
}

class Model extends JSONModel<IVuesionPackage> {
  constructor() {
    super(runtimeRoot('package.json'));
  }

  public updateModuleNameMapper() {
    const aliases = VuesionConfig.getWebpackAliases();

    if (aliases) {
      Object.keys(aliases).map((alias: string) => {
        this.model.jest.moduleNameMapper[`^${alias}/(.*)$`] = `<rootDir>/${aliases[alias]}/$1`;
      });

      this.save(false);
    }
  }
}

export const VuesionPackage = new Model();
