import { Command, ICommandHandler, IRunOptions } from '../lib/command';
import { packageRoot } from '../utils/path';

@Command({
  name: 'generate',
  alias: 'g',
  description: 'Generate Components, Connected Components or Modules.',
})
export class Generate implements ICommandHandler {
  public async run(args: string[], options: IRunOptions) {
    process.argv = [process.argv[0], null, '--plopfile', packageRoot('dist/generators/index.js'), ...args];
    require('plop');
  }
}
