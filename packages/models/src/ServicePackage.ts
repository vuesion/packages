import { JSONModel } from './JSONModel';
import { packagesRoot } from '@vuesion/utils';

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
    super(packagesRoot('service', 'package.json'));

    this.description = this.model ? this.model.description : '';
    this.name = this.model ? this.model.name : '';
    this.version = this.model ? this.model.version : '';
  }
}

export const ServicePackage = new Model();
