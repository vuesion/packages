import { JSONModel } from './JSONModel';
import { packageRoot } from '../utils/path';

interface IServicePackage extends Object {
  name: string;
  version: string;
  description: string;
}

class Model extends JSONModel<IServicePackage> implements IServicePackage {
  public description: string;
  public name: string;
  public version: string;

  constructor() {
    super(packageRoot('package.json'));

    this.description = this.model.description;
    this.name = this.model.name;
    this.version = this.model.version;
  }
}

export const ServicePackage = new Model();
