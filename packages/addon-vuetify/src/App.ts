import { SyntaxKind } from 'ts-morph';
import { runtimeRoot } from '@vuesion/utils';
import { ASTModel } from '@vuesion/models';

export class App extends ASTModel {
  constructor() {
    super(runtimeRoot('src/app/app.ts'));
  }

  public transform() {
    this.load();

    const importCount = this.sourceFile.getChildrenOfKind(SyntaxKind.ImportDeclaration).length;
    this.sourceFile.insertStatements(importCount, `import Vuetify from 'vuetify';`);
    this.sourceFile.insertStatements(importCount + 1, `\nVue.use(Vuetify);`);

    const options = this.sourceFile
      .getFirstChildByKind(SyntaxKind.VariableStatement)
      .getFirstChildByKind(SyntaxKind.VariableDeclarationList)
      .getFirstChildByKind(SyntaxKind.VariableDeclaration)
      .getFirstChildByKind(SyntaxKind.ArrowFunction)
      .getFirstChildByKind(SyntaxKind.Block)
      .getFirstChildByKind(SyntaxKind.VariableStatement)
      .getFirstChildByKind(SyntaxKind.VariableDeclarationList)
      .getFirstChildByKind(SyntaxKind.VariableDeclaration)
      .getFirstChildByKind(SyntaxKind.NewExpression)
      .getFirstChildByKind(SyntaxKind.ObjectLiteralExpression);
    const pluginIndex = options.getChildrenOfKind(SyntaxKind.ShorthandPropertyAssignment).length;
    const vuetify = `vuetify: new Vuetify(),`;

    options.insertProperty(pluginIndex, vuetify);

    this.save();
  }
}
