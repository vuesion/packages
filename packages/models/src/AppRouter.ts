import { SyntaxKind } from 'ts-morph';
import { lowerFirst, upperFirst, camelCase } from 'lodash';
import { runtimeRoot } from '@vuesion/utils';
import { ASTModel } from './ASTModel';

class Model extends ASTModel {
  constructor() {
    super(runtimeRoot('src/app/router.ts'));
  }

  public addModule(moduleName: string) {
    this.load();

    const parts = moduleName.split('/');

    moduleName = camelCase(parts.pop());

    const modulePath = parts.join('/');

    this.addImportDeclaration(
      `import { ${upperFirst(moduleName)}Routes } from './${modulePath.length > 0 ? `${modulePath}/` : ''}${lowerFirst(
        moduleName,
      )}/routes';`,
    );

    const routes = this.sourceFile
      .getVariableDeclaration('router')
      .getFirstChildByKind(SyntaxKind.NewExpression)
      .getFirstChildByKind(SyntaxKind.ObjectLiteralExpression)
      .getChildrenOfKind(SyntaxKind.PropertyAssignment)
      .find((propertyAssignment) => propertyAssignment.getName() === 'routes')
      .getFirstChildByKind(SyntaxKind.ArrayLiteralExpression);
    const elementCount = routes.getChildrenOfKind(SyntaxKind.SpreadElement).length;

    routes.insertElement(elementCount, `...${upperFirst(moduleName)}Routes`);

    this.save();
  }
}

export const AppRouter = new Model();
