import { Command, ICommandHandler } from '../lib/command';
import { handleProcessError, runProcess } from '../utils/process';
import { log, logErrorBold, Spinner } from '../utils/ui';
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

  public async run(args: string[], silent: boolean) {
    process.env.NODE_ENV = 'production';

    try {
      await runProcess('rimraf', ['./dist']);
    } catch (e) {
      handleProcessError(e);
    }

    if (this.analyze) {
      analyze(silent).catch((e) => logErrorBold(e));
    } else if (this.spa) {
      spa(silent).catch((e) => logErrorBold(e));
    } else {
      build(silent).catch((e) => logErrorBold(e));
    }
  }
}

const runWebpack = (configName: string, silent: boolean) => {
  return runProcess(
    'webpack',
    ['--mode', 'production', '--config', packageRoot(`dist/webpack/config/${configName}.js`)],
    { silent },
  );
};

const build = async (silent: boolean) => {
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

  if (!silent) {
    spinner.start();
    setSpinnerMessage();
  }

  const run = (configName: string) => {
    promises.push(
      runWebpack(configName, true).then(() => {
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

    if (!silent) {
      spinner.stop();
    }
  } catch (e) {
    handleProcessError(e, spinner);
  }
};

const analyze = async (silent: boolean) => {
  process.env.ANALYZE = 'true';

  const startTime: number = Date.now();
  const spinner = new Spinner();

  if (!silent) {
    spinner.start();
    spinner.message = `Start analyzing client bundle...`;
  }

  try {
    await runWebpack('client', true);
  } catch (e) {
    handleProcessError(e, spinner);
  }

  if (!silent) {
    spinner.message = `Analysis finished in ${Date.now() - startTime}ms`;
    spinner.stop();
  }
};

const spa = async (silent: boolean) => {
  const startTime: number = Date.now();
  const spinner = new Spinner();

  if (!silent) {
    spinner.start();
    spinner.message = `Start building client bundle only...`;
  }

  try {
    await runWebpack('spa', true);
  } catch (e) {
    handleProcessError(e, spinner);
  }

  if (!silent) {
    spinner.message = `Production build finished in ${Date.now() - startTime}ms`;
    spinner.stop();
  }
};
