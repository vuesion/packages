import * as fs from 'fs';
import { format } from 'prettier';
import { logError } from '../utils';
import { Model } from './AbstractModel';

export class JSONModel<T> extends Model {
  protected path: string = null;
  public model: T = null;

  constructor(path: string) {
    super();
    this.path = path;
    this.load();
  }

  public load() {
    if (fs.existsSync(this.path)) {
      try {
        this.model = JSON.parse(fs.readFileSync(this.path).toString());
      } catch (e) {
        logError(e);
      }
    }
  }

  public save(prettier = true) {
    let jsonString = '';
    try {
      jsonString = JSON.stringify(this.model, null, this.prettierConfig.tabWidth) + '\n';

      const data = prettier
                   ? format(jsonString, {
          ...this.prettierConfig,
          parser: 'json',
        })
                   : jsonString;

      fs.writeFileSync(this.path, data);
    } catch (e) {
      logError(e);
    }
  }
}
