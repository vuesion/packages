import * as fs from 'fs';
import { Command, ICommandHandler } from '../lib/command';
import { getWebpackAliases } from '../models/Config';
import { runtimeRoot } from '../utils/path';

@Command({
  name: 'test',
  alias: 't',
  description: 'Run unit-tests with jest. All Jest CLI options are supported.',
  options: [{ flags: '-c, --coverage', description: 'Run tests with coverage.' }],
})
export class Test implements ICommandHandler {
  public coverage: boolean;

  public async run(args: string[]) {
    process.env.NODE_ENV = 'test';

    const jest = require('jest');
    const aliases = getWebpackAliases();
    const jestConfig = JSON.parse(fs.readFileSync(runtimeRoot('package.json')).toString()).jest;

    if (aliases) {
      if (!jestConfig.moduleNameMapper) {
        jestConfig.moduleNameMapper = {};
      }

      Object.keys(aliases).map((alias: string) => {
        jestConfig.moduleNameMapper[`^${alias}/(.*)$`] = `<rootDir>/${aliases[alias]}/$1`;
      });

      args.push(`--config=${JSON.stringify(jestConfig)}`);
    }

    jest.run(args);
  }
}
