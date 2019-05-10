import axios from 'axios';
import { Command, ICommandHandler, IRunOptions } from '../lib/command';
import { handleProcessError, runProcess } from '../utils/process';
import { HeadLine, logInfo } from '../utils/ui';
import { packageRoot } from '../utils/path';
import { sync } from 'rimraf';

export const waitForApp = async (url: string) => {
  const interval = 500;
  const timeout = 30000;
  let elapsedTime = 0;
  let instance;

  return new Promise((resolve, reject) => {
    instance = setInterval(async () => {
      try {
        await axios.get(url);
        clearInterval(instance);
        resolve();
      } catch (e) {
        elapsedTime += interval;

        if (elapsedTime > timeout) {
          clearInterval(instance);
          reject({
            code: (e && e.response && e.response.status) || 500,
            trace: `Unable to connect to dev-server.\nTry to open ${url} manually.`,
          });
        }
      }
    }, interval);
  });
};
const opn = require('open');

@Command({
  name: 'dev',
  alias: 'd',
  description: 'Serve application for development.',
  options: [
    { flags: '-p, --port <port>', description: 'Web-server port.', defaultValue: '3000' },
    { flags: '-o, --open', description: 'Open the dev environment in your default web browser.' },
  ],
})
export class Dev implements ICommandHandler {
  public port: string;
  public open: boolean;

  public async run(args: string[], options: IRunOptions) {
    process.env.NODE_ENV = 'development';
    process.env.PORT = this.port;

    const url = `http://localhost:${this.port}`;

    try {
      sync('./dist');

      HeadLine('Start development mode...');

      await runProcess(
        'node',
        [packageRoot('dist/scripts/run-webpack.js'), 'dev-server', 'development', `${options.debug}`],
        options,
      );

      runProcess(
        'node',
        [packageRoot('dist/scripts/run-webpack.js'), 'server', 'development', `${options.debug}`],
        options,
      );

      if (this.open) {
        try {
          await waitForApp(url);
          await opn(url, { wait: false });
        } catch (e) {
          logInfo(`Dev-server returned status code: ${e.code}.`);
          logInfo(e.trace);
        }
      }
    } catch (e) {
      handleProcessError(e);
    }
  }
}
