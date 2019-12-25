import * as fs from 'fs';
import { format } from 'prettier';
import { logError } from '@vuesion/utils';
import { project } from './ast';
import { SourceFile } from 'ts-morph';
import { Model } from './AbstractModel';

export class ASTModel extends Model {
  protected path: string = null;
  protected sourceFile: SourceFile = null;

  constructor(path: string) {
    super();
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
            ...this.prettierConfig,
            parser: 'typescript',
          })
        : this.sourceFile.getText();

      fs.writeFileSync(this.path, data, { encoding: 'utf-8' });
    } catch (e) {
      logError(e);
    }
  }
}
