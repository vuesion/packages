import { Block, SyntaxKind } from 'ts-morph';
import { runtimeRoot } from '@vuesion/utils';
import { ASTModel } from '@vuesion/models';

export class Isomorphic extends ASTModel {
  constructor() {
    super(runtimeRoot('src/server/isomorphic.ts'));
  }

  private getExportFunction() {
    return this.sourceFile
      .getFirstChildByKind(SyntaxKind.ExportAssignment)
      .getFirstChildByKind(SyntaxKind.ArrowFunction)
      .getFirstChildByKind(SyntaxKind.Block)
      .getFirstChildByKind(SyntaxKind.ReturnStatement)
      .getFirstChildByKind(SyntaxKind.NewExpression)
      .getFirstChildByKind(SyntaxKind.ArrowFunction)
      .getFirstChildByKind(SyntaxKind.Block);
  }

  private getRouterReady(exportReturnFunction) {
    return exportReturnFunction
      .getChildrenOfKind(SyntaxKind.ExpressionStatement)
      .find((expression) => {
        const propertyAcccess = expression
          .getFirstChildByKind(SyntaxKind.CallExpression)
          .getFirstChildByKind(SyntaxKind.PropertyAccessExpression);

        if (propertyAcccess) {
          const identifiers = propertyAcccess.getChildrenOfKind(SyntaxKind.Identifier);

          return identifiers[0].getText() === 'router' && identifiers[1].getText() === 'onReady';
        }
      })
      .getFirstChildByKind(SyntaxKind.CallExpression)
      .getFirstChildByKind(SyntaxKind.ArrowFunction)
      .getFirstChildByKind(SyntaxKind.Block);
  }

  private removeRouteMatchesCatchAll(routerReady) {
    const routeMatchesCatchAll = routerReady.getChildrenOfKind(SyntaxKind.VariableStatement).find(
      (varStatement) =>
        varStatement
          .getFirstChildByKind(SyntaxKind.VariableDeclarationList)
          .getFirstChildByKind(SyntaxKind.VariableDeclaration)
          .getFirstChildByKind(SyntaxKind.Identifier)
          .getText() === 'routeMatchesCatchAll',
    );

    if (routeMatchesCatchAll) {
      routerReady.removeText(routeMatchesCatchAll.getPos(), routeMatchesCatchAll.getEnd());
    }
  }

  private removeRouteMatchesCatchAllIfStatement(routerReady) {
    const routeMatchesCatchAllIfStatement = routerReady
      .getChildrenOfKind(SyntaxKind.IfStatement)
      .find((varStatement) => {
        const identifier = varStatement.getFirstChildByKind(SyntaxKind.Identifier);

        if (identifier) {
          return identifier.getText() === 'routeMatchesCatchAll';
        }
      });

    if (routeMatchesCatchAllIfStatement) {
      routerReady.removeText(routeMatchesCatchAllIfStatement.getPos(), routeMatchesCatchAllIfStatement.getEnd());
    }
  }

  private addErrorHandling(routerReady) {
    const tryStatement = routerReady.getFirstChildByKind(SyntaxKind.TryStatement);

    if (tryStatement) {
      const catchClause: Block = tryStatement
        .getFirstChildByKind(SyntaxKind.CatchClause)
        .getFirstChildByKind(SyntaxKind.Block);

      catchClause.insertText(
        catchClause.getStart() + 1,
        `if (e.response.status === 404) {
  reject({ code: 404 });
} else {
  reject(e);
}
`,
      );
    }
  }

  public transform() {
    this.load();

    const exportReturnFunction = this.getExportFunction();
    const routerReady: Block = this.getRouterReady(exportReturnFunction);

    this.removeRouteMatchesCatchAll(routerReady);
    this.removeRouteMatchesCatchAllIfStatement(routerReady);
    this.addErrorHandling(routerReady);

    this.save();
  }
}
