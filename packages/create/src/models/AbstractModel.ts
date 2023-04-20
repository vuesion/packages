import * as fs from 'fs';
import { runtimeRoot } from '../utils';

export abstract class Model {
  protected prettierConfig;

  constructor() {
    try {
      this.prettierConfig = JSON.parse(fs.readFileSync(runtimeRoot('.prettierrc')).toString());
    } catch (e) {
      this.prettierConfig = {
        singleQuote: true,
        bracketSpacing: true,
        arrowParens: 'always',
        trailingComma: 'all',
        tabWidth: 2,
        printWidth: 120,
        endOfLine: 'lf',
      };
    }
  }
}
