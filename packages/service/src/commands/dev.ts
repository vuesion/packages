import axios from 'axios';
import { Command, ICommandHandler } from '../lib/command';
import { handleProcessError, runProcess } from '../utils/process';
import { HeadLine } from '../utils/ui';
import { packageRoot } from '../utils/path';

const waitForApp = async (url: string) => {
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
          reject({ code: 1, trace: 'not able to connect to dev-server' });
        }
      }
    }, interval);
  });
};
const opn = require('opn');

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

  public async run(args: string[], silent: boolean) {
    process.env.NODE_ENV = 'development';
    process.env.PORT = this.port;

    const url = `http://localhost:${this.port}`;

    try {
      await runProcess('rimraf', ['./dist'], { silent });

      HeadLine('Start development mode...');

      await runProcess(
        'webpack',
        ['--mode', 'development', '--config', packageRoot('dist/webpack/config/dev-server.js')],
        { silent },
      );

      runProcess('webpack', ['--mode', 'development', '--config', packageRoot('dist/webpack/config/server.js')], {
        silent,
      });

      if (this.open) {
        await waitForApp(url);
        await opn(url, { wait: false });
      }
    } catch (e) {
      handleProcessError(e);
    }
  }
}
