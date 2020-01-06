import { Block, SyntaxKind } from 'ts-morph';
import { runtimeRoot } from '@vuesion/utils';
import { ASTModel } from './ASTModel';

class Model extends ASTModel {
  constructor() {
    super(runtimeRoot('.vuesion/webpack.config.js'));
  }

  public addBlock(block: string) {
    this.load();

    const configFunction: Block = this.sourceFile
      .getFirstChildByKind(SyntaxKind.ExpressionStatement)
      .getFirstChildByKind(SyntaxKind.BinaryExpression)
      .getFirstChildByKind(SyntaxKind.ArrowFunction)
      .getFirstChildByKind(SyntaxKind.Block);

    configFunction.insertStatements(configFunction.getChildCount() - 2, block);

    this.save();
  }
}

export const VuesionWebpackConfig = new Model();
