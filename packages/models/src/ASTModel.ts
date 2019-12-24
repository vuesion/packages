import * as fs from 'fs';
import { format } from 'prettier';
import { logError, runtimeRoot } from '@vuesion/utils';
import { project } from './ast';
import { SourceFile } from 'ts-morph';

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

export class ASTModel {
  protected path: string = null;
  protected sourceFile: SourceFile = null;

  constructor(path: string) {
    this.path = path;
    this.load();
  }

  public load() {
    if (fs.existsSync(this.path)) {
      try {
        this.sourceFile = project.getSourceFile(this.path);
      } catch (e) {
        logError(e);
      }
    }
  }

  public save(prettier = true) {
    try {
      project.saveSync();

      const data = prettier
        ? format(this.sourceFile.getText(), {
            ...prettierConfig,
            parser: 'typescript',
          })
        : this.sourceFile.getText();

      fs.writeFileSync(this.path, data, { encoding: 'utf-8' });
    } catch (e) {
      logError(e);
    }
  }
}
