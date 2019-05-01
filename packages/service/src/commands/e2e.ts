import { Command, ICommandHandler } from '../lib/command';
import { logError } from '../utils/ui';
const cypress = require('cypress');

@Command({
  name: 'e2e',
  alias: 'e',
  description: 'Run e2e tests with cypress.io.',
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
