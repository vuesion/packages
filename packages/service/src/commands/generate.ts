import { Command, ICommandHandler } from '../decorators/command';
import { packagesRoot } from '@vuesion/utils/dist/path';

@Command({
  name: 'generate',
  alias: 'g',
  description: 'Generate Components, Connected Components or Modules.',
})
export class Generate implements ICommandHandler {
  public async run(args: string[]) {
    process.argv = [process.argv[0], null, '--plopfile', packagesRoot('service', 'dist/generators/index.js'), ...args];

    const { Plop, run } = require('plop');
    const argv = require('minimist')(process.argv);

    Plop.launch(
      {
        cwd: argv.cwd,
        configPath: argv.plopfile,
        require: argv.require,
        completion: argv.completion,
      },
      run,
    );
  }
}
