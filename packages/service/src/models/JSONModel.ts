import * as fs from 'fs';
import { format } from 'prettier';
import { runtimeRoot } from '../utils/path';
import { logError, logInfo } from '../utils/ui';

const prettierConfig = JSON.parse(fs.readFileSync(runtimeRoot('.prettierrc')).toString());

export class JSONModel<T> {
  protected path: string = null;
  protected model: T = null;

  constructor(path: string) {
    this.path = path;
    this.load();
  }

  public load() {
    try {
      this.model = JSON.parse(fs.readFileSync(this.path).toString());
    } catch (e) {
      logError(e);
      logInfo(fs.readFileSync(this.path).toString());
    }
  }

  public save(prettier: boolean = true) {
    let jsonString = '';
    try {
      jsonString = JSON.stringify(this.model, null, (prettierConfig && prettierConfig.tabWidth) || 2) + '\n';
    } catch (e) {
      logError(e);
      logInfo(this.model);
    }

    const data = prettier
      ? format(jsonString, {
          ...prettierConfig,
          parser: 'json',
        })
      : jsonString;

    fs.writeFileSync(this.path, data);
  }
}
