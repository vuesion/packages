import { JSONModel } from '@vuesion/models/dist';
import { runtimeRoot } from '@vuesion/utils/dist';

class Model extends JSONModel<any> {
  constructor() {
    super(runtimeRoot('tsconfig.json'));
  }
}

export const TsConfig = new Model();
