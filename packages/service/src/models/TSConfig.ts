import * as ts from 'typescript';
import { JSONModel } from './JSONModel';
import { runtimeRoot } from '../utils/path';
import { VuesionConfig } from './VuesionConfig';
type CompilerOptions = typeof ts.parseCommandLine extends (...args: any[]) => infer TResult
  ? TResult extends { options: infer TOptions }
    ? TOptions
    : never
  : never;
type TypeAcquisition = typeof ts.parseCommandLine extends (...args: any[]) => infer TResult
  ? TResult extends { typeAcquisition?: infer TTypeAcquisition }
    ? TTypeAcquisition
    : never
  : never;

interface ITSConfig {
  compilerOptions: CompilerOptions;
  exclude: string[];
  compileOnSave: boolean;
  extends: string;
  files: string[];
  include: string[];
  typeAcquisition: TypeAcquisition;
}

class Model extends JSONModel<ITSConfig> {
  constructor() {
    super(runtimeRoot('tsconfig.json'));
  }

  public updateCompilerOptionsPaths() {
    const aliases = VuesionConfig.getWebpackAliases();

    if (aliases) {
      Object.keys(aliases).map((alias: string) => {
        this.model.compilerOptions.paths[`${alias}/*`] = [`${aliases[alias]}/*`];
      });

      this.save();
    }
  }
}

export const TSConfig = new Model();
