import { JSONModel } from '@vuesion/models/dist';
import { runtimeRoot } from '@vuesion/utils/dist';

interface IFirebaseJSON {
  functions: {
    predeploy: string | string[];
  };
  hosting: {
    public: string;
    ignore: string[];
    rewrites: Array<{ source: string; destination?: string; function?: string }>;
  };
}

class Model extends JSONModel<IFirebaseJSON> {
  constructor() {
    super(runtimeRoot('firebase.json'));
  }
}

export const FireBaseJSON = new Model();
