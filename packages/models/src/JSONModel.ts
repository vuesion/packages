import * as fs from 'fs';
import { format } from 'prettier';
import { logError, runtimeRoot } from '@vuesion/utils';

let prettierConfig;

try {
  prettierConfig = JSON.parse(fs.readFileSync(runtimeRoot('.prettierrc')).toString());
} catch (e) {
  prettierConfig = {
    singleQuote: true,
    bracketSpacing: true,
    arrowParens: 'always',
    trailingComma: 'all',
    tabWidth: 2,
    printWidth: 120,
    endOfLine: 'lf',
  };
}

export class JSONModel<T> {
  protected path: string = null;
  protected model: T = null;

  constructor(path: string) {
    this.path = path;
    this.load();
  }

  public load(path: string = this.path) {
    this.path = path;

    if (fs.existsSync(path)) {
      try {
        this.model = JSON.parse(fs.readFileSync(path).toString());
      } catch (e) {
        logError(e);
      }
    }
  }

  public save(prettier: boolean = true) {
    let jsonString = '';
    try {
      jsonString = JSON.stringify(this.model, null, prettierConfig.tabWidth) + '\n';

      const data = prettier
        ? format(jsonString, {
            ...prettierConfig,
            parser: 'json',
          })
        : jsonString;

      fs.writeFileSync(this.path, data);
    } catch (e) {
      logError(e);
    }
  }
}
