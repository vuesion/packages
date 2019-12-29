import { JSONModel } from '@vuesion/models/dist';
import { runtimeRoot } from '@vuesion/utils/dist';

class Model extends JSONModel<{ api: { baseUrl: string } }> {
  constructor() {
    super(runtimeRoot('src/app/config/production.json'));
  }
}

export const ProductionConfig = new Model();
