import { Block, SyntaxKind } from 'ts-morph';
import { runtimeRoot } from '@vuesion/utils';
import { ASTModel } from './ASTModel';

class Model extends ASTModel {
  constructor() {
    super(runtimeRoot('src/server/middlewares/index.ts'));
  }

  public addImport(importDeclaration: string) {
    this.load();
    const importCount = this.sourceFile.getChildrenOfKind(SyntaxKind.ImportDeclaration).length;
    this.sourceFile.insertStatements(importCount, importDeclaration);

    this.save();
  }

  public addMiddleware(middleware: string) {
    this.load();

    const middlewareFunction: Block = this.sourceFile
      .getFirstChildByKind(SyntaxKind.VariableStatement)
      .getFirstChildByKind(SyntaxKind.VariableDeclarationList)
      .getFirstChildByKind(SyntaxKind.VariableDeclaration)
      .getFirstChildByKind(SyntaxKind.ArrowFunction)
      .getFirstChildByKind(SyntaxKind.Block);

    middlewareFunction.addStatements(middleware);

    this.save();
  }
}

export const ExpressMiddlewares = new Model();
