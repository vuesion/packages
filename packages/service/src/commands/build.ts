import { Command, ICommandHandler, IRunOptions } from '../lib/command';
import { handleProcessError, runProcess } from '../utils/process';
import { logErrorBold, Spinner } from '../utils/ui';
import { packageRoot } from '../utils/path';

@Command({
  name: 'build',
  alias: 'b',
  description: 'Build project for production.',
  options: [
    { flags: '-a, --analyze', description: 'Analyze client bundle.' },
    { flags: '-spa, --spa', description: 'Build only client-side application.' },
  ],
})
export class Build implements ICommandHandler {
  public analyze: boolean;
  public spa: boolean;

  public async run(args: string[], options: IRunOptions) {
    process.env.NODE_ENV = 'production';

    try {
      await runProcess('rimraf', ['./dist'], { silent: true, ...options });
    } catch (e) {
      handleProcessError(e);
    }

    if (this.analyze) {
      analyze(options).catch((e) => logErrorBold(e));
    } else if (this.spa) {
      spa(options).catch((e) => logErrorBold(e));
    } else {
      build(options).catch((e) => logErrorBold(e));
    }
  }
}

const runWebpack = (configName: string, options: IRunOptions) => {
  return runProcess(
    'webpack',
    ['--mode', 'production', '--config', packageRoot(`dist/webpack/config/${configName}.js`)],
    { silent: true, ...options },
  );
};

const build = async (options: IRunOptions) => {
  const promises = [];
  const startTime: number = Date.now();
  const spinner = new Spinner();
  let done = 0;

  const setSpinnerMessage = () => {
    if (done === 3) {
      spinner.message = `Finished building production bundles in ${Date.now() - startTime}ms`;
    } else {
      spinner.message = `Building production bundles ${done}/3 ...`;
    }
  };

  spinner.start(options.debug);
  setSpinnerMessage();

  const run = (configName: string) => {
    promises.push(
      runWebpack(configName, options).then(() => {
        done = done + 1;
        setSpinnerMessage();
      }),
    );
  };

  run('client');
  run('server');
  run('isomorphic');

  try {
    await Promise.all(promises);
    spinner.stop();
  } catch (e) {
    handleProcessError(e, spinner);
  }
};

const analyze = async (options: IRunOptions) => {
  process.env.ANALYZE = 'true';

  const startTime: number = Date.now();
  const spinner = new Spinner();

  spinner.start(options.debug);
  spinner.message = `Start analyzing client bundle...`;

  try {
    await runWebpack('client', options);
  } catch (e) {
    handleProcessError(e, spinner);
  }

  spinner.message = `Analysis finished in ${Date.now() - startTime}ms`;
  spinner.stop();
};

const spa = async (options: IRunOptions) => {
  const startTime: number = Date.now();
  const spinner = new Spinner();

  spinner.start(options.debug);
  spinner.message = `Start building client bundle only...`;

  try {
    await runWebpack('spa', options);
  } catch (e) {
    handleProcessError(e, spinner);
  }

  spinner.message = `Production build finished in ${Date.now() - startTime}ms`;
  spinner.stop();
};
