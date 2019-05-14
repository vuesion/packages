import axios from 'axios';
import { Command, ICommandHandler, IRunOptions } from '../decorators/command';
import { handleProcessError, runProcess } from '@vuesion/utils/dist/process';
import { HeadLine, logInfo } from '@vuesion/utils/dist/ui';
import { packagesRoot } from '@vuesion/utils/dist/path';
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
        [
          packagesRoot('webpack', 'dist/scripts/run-webpack.js'),
          packagesRoot('webpack', 'dist/config/dev-server.js'),
          'development',
          `${options.debug}`,
        ],
        options,
      );

      runProcess(
        'node',
        [
          packagesRoot('webpack', 'dist/scripts/run-webpack.js'),
          packagesRoot('webpack', 'dist/config/server.js'),
          'development',
          `${options.debug}`,
        ],
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
