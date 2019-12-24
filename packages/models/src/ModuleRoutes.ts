import { SyntaxKind } from 'ts-morph';
import { runtimeRoot } from '@vuesion/utils';
import { ASTModel } from './ASTModel';

export class ModuleRoutes extends ASTModel {
  constructor(moduleName: string) {
    super(runtimeRoot(`src/app/${moduleName}/routes.ts`));
  }

  public removeRoute(route: string) {
    const routes = this.sourceFile
      .getFirstChildByKind(SyntaxKind.VariableStatement)
      .getFirstChildByKind(SyntaxKind.VariableDeclarationList)
      .getFirstChildByKind(SyntaxKind.VariableDeclaration)
      .getFirstChildByKind(SyntaxKind.ArrayLiteralExpression);
    const matchedRoute = routes.getChildrenOfKind(SyntaxKind.ObjectLiteralExpression).find((routeObject) => {
      const routeName = routeObject
        .getFirstChildByKind(SyntaxKind.PropertyAssignment)
        .getFirstChildByKind(SyntaxKind.StringLiteral)
        .getText()
        .replace(/('|")/g, '');
      return routeName === route;
    });

    if (matchedRoute) {
      routes.removeElement(matchedRoute);
    }

    this.save();
  }
}
