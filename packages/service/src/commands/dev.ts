import { Command, ICommandHandler } from '../lib/command';
import { handleProcessError, runProcess } from '../utils/process';
import { HeadLine } from '../utils/ui';
import { packageRoot } from '../utils/path';

@Command({
  name: 'dev',
  alias: 'd',
  description: 'Serve application for development.',
  options: [{ flags: '-p, --port <port>', description: 'Web-server port.', defaultValue: '3000' }],
})
export class Dev implements ICommandHandler {
  public port: string;

  public async run(args: string[], silent: boolean) {
    process.env.NODE_ENV = 'development';
    process.env.PORT = this.port;

    try {
      await runProcess('rimraf', ['./dist'], { silent });

      HeadLine('Start development mode...');

      await runProcess(
        'webpack',
        ['--mode', 'development', '--config', packageRoot('dist/webpack/config/dev-server.js')],
        { silent },
      );

      await runProcess('webpack', ['--mode', 'development', '--config', packageRoot('dist/webpack/config/server.js')], {
        silent,
      });
    } catch (e) {
      handleProcessError(e);
    }
  }
}
