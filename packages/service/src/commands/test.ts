import { Command, ICommandHandler } from '../decorators/command';

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

    jest.run(args);
  }
}
