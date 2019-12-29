import { JSONModel } from '@vuesion/models/dist';
import { runtimeRoot } from '@vuesion/utils/dist';

class Model extends JSONModel<{ projects: { default: string } }> {
  constructor() {
    super(runtimeRoot('.firebaseRc'));
  }
}

export const FireBaseRc = new Model();
