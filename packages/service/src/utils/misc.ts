import { getWebpackAliases } from '../models/Config';
import { runtimeRoot } from './path';
import * as fs from 'fs';

const prettier = require('prettier');

export const updateTsConfig = () => {
  const aliases = getWebpackAliases();

  if (aliases) {
    const tsconfigPath = runtimeRoot('tsconfig.json');
    const tsconfig: any = JSON.parse(fs.readFileSync(tsconfigPath).toString());

    Object.keys(aliases).map((alias: string) => {
      tsconfig.compilerOptions.paths[`${alias}/*`] = [`${aliases[alias]}/*`];
    });

    fs.writeFileSync(
      tsconfigPath,
      prettier.format(JSON.stringify(tsconfig), {
        ...JSON.parse(fs.readFileSync(runtimeRoot('.prettierrc')).toString()),
        parser: 'json',
      }),
    );
  }
};
