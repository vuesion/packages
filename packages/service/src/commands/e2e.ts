import { Command, ICommandHandler, IRunOptions } from '../lib/command';
import { handleProcessError, runProcess } from '../utils/process';

@Command({
  name: 'e2e',
  alias: 'e',
  description: 'Run e2e tests with cypress.io. All cypress CLI options are supported.',
})
export class E2E implements ICommandHandler {
  public async run(args: string[], options: IRunOptions) {
    args = args.concat(['run']);

    try {
      await runProcess('cypress', args, options);
    } catch (e) {
      handleProcessError(e);
    }
  }
}
