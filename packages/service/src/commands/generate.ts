import { Command, ICommandHandler, IRunOptions } from '../decorators/command';
import { packagesRoot } from '@vuesion/utils/dist/path';

@Command({
  name: 'generate',
  alias: 'g',
  description: 'Generate Components, Connected Components or Modules.',
})
export class Generate implements ICommandHandler {
  public async run(args: string[], options: IRunOptions) {
    process.argv = [process.argv[0], null, '--plopfile', packagesRoot('service', 'dist/generators/index.js'), ...args];
    require('plop');
  }
}
