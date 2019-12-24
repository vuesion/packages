import { SyntaxKind } from 'ts-morph';
import { lowerFirst, upperFirst, camelCase } from 'lodash';
import { runtimeRoot } from '@vuesion/utils';
import { ASTModel } from './ASTModel';

class Model extends ASTModel {
  constructor() {
    super(runtimeRoot('src/app/state.ts'));
  }

  public addModule(moduleName: string) {
    this.load();

    const parts = moduleName.split('/');

    moduleName = camelCase(parts.pop());

    const modulePath = parts.join('/');

    const importCount = this.sourceFile.getChildrenOfKind(SyntaxKind.ImportDeclaration).length;
    this.sourceFile.insertStatements(
      importCount,
      `import { I${upperFirst(moduleName)}State } from './${modulePath.length > 0 ? `${modulePath}/` : ''}${lowerFirst(
        moduleName,
      )}/state';`,
    );

    const appState = this.sourceFile.getFirstChildByKind(SyntaxKind.InterfaceDeclaration);

    appState.addProperty({
      name: `${lowerFirst(moduleName)}?`,
      type: `I${upperFirst(moduleName)}State`,
    });

    this.save();
  }
}

export const AppState = new Model();
