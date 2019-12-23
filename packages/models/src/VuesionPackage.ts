import { JSONModel } from './JSONModel';
import { runtimeRoot } from '@vuesion/utils';
import { VuesionConfig } from './VuesionConfig';

interface IVuesionPackage extends Object {
  name: string;
  version: string;
  description: string;
  repository: { type: string; url: string };
  keywords: string[];
  author: string;
  license: string;
  homepage: string;
  bugs: { url: string };
  scripts: any;
  dependencies: any;
  devDependencies: any;
  jest: { moduleNameMapper: any };
}

class Model extends JSONModel<IVuesionPackage> implements IVuesionPackage {
  public name: string;
  public version: string;
  public description: string;
  public repository: { type: string; url: string };
  public keywords: string[];
  public author: string;
  public license: string;
  public homepage: string;
  public bugs: { url: string };
  public scripts: any;
  public dependencies: any;
  public devDependencies: any;
  public jest: { moduleNameMapper: any };

  constructor() {
    super(runtimeRoot('package.json'));

    if (this.model !== null) {
      this.name = this.model.name;
      this.version = this.model.version;
      this.description = this.model.description;
      this.repository = this.model.repository;
      this.keywords = this.model.keywords;
      this.author = this.model.author;
      this.license = this.model.license;
      this.homepage = this.model.homepage;
      this.bugs = this.model.bugs;
      this.scripts = this.model.scripts;
      this.dependencies = this.model.dependencies;
      this.devDependencies = this.model.devDependencies;
      this.jest = this.model.jest;
    }
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

  public save(prettier = true) {
    if (this.model !== null) {
      this.model.name = this.name;
      this.model.version = this.version;
      this.model.description = this.description;
      this.model.repository = this.repository;
      this.model.keywords = this.keywords;
      this.model.author = this.author;
      this.model.license = this.license;
      this.model.homepage = this.homepage;
      this.model.bugs = this.bugs;
      this.model.scripts = this.scripts;
      this.model.dependencies = this.dependencies;
      this.model.devDependencies = this.devDependencies;
      this.model.jest = this.jest;
    }

    super.save(prettier);
  }
}

export const VuesionPackage = new Model();
