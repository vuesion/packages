import { Command, ICommandHandler } from '../decorators/command';
import { logError } from '@vuesion/utils/dist/ui';
const cypress = require('cypress');

@Command({
  name: 'e2e',
  alias: 'e',
  description: 'Run e2e tests with cypress.io. All cypress CLI options are supported.',
})
export class E2E implements ICommandHandler {
  public async run() {
    try {
      await cypress.run();
    } catch (e) {
      logError(e);
    }
  }
}
