import * as fs from 'fs';
import { getWebpackAliases } from '../models/Config';
import { runtimeRoot } from './path';
import { format } from 'prettier';

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
      format(JSON.stringify(tsconfig), {
        ...JSON.parse(fs.readFileSync(runtimeRoot('.prettierrc')).toString()),
        parser: 'json',
      }),
    );
  }
};
