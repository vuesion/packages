import { sync } from 'glob';
import * as fs from 'fs';

export const ORGANISATION = '@vuesion';

export interface IPackage {
  name: string;
  version: string;
  dependencies: any;
  devDependencies: any;
  graphDeps: string[];
}

export class Package implements IPackage {
  private model: any;
  private path: any;
  public name: string;
  public version: string;
  public dependencies: any;
  public devDependencies: any;
  public graphDeps: string[] = [];

  constructor(model: any, path: string) {
    this.model = model;
    this.path = path;
    this.name = model.name;
    this.version = model.version;
    this.dependencies = model.dependencies || {};
    this.devDependencies = model.devDependencies || {};

    this.dependencies = this.filterOrgPackage(this.dependencies);
    this.devDependencies = this.filterOrgPackage(this.devDependencies);
  }

  private filterOrgPackage(object: any) {
    const result = {};

    Object.keys(object).forEach((key: string) => {
      if (key.indexOf(ORGANISATION) > -1) {
        result[key] = object[key];
        this.graphDeps.push(key);
      }
    });

    return result;
  }

  public save() {
    this.model.name = this.name;
    this.model.version = this.version;
    this.model.dependencies = { ...this.model.dependencies, ...this.dependencies };
    this.model.devDependencies = { ...this.model.devDependencies, ...this.devDependencies };
    fs.writeFileSync(this.path, JSON.stringify(this.model, null, 2) + '\n');
  }
}

const packages = sync('./packages/*/package.json').map((path: string) => {
  const file = JSON.parse(fs.readFileSync(path).toString());
  return new Package(file, path);
});

export const getPackages = (): Package[] => {
  return packages;
};
