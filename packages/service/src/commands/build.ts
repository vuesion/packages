import { Command, ICommandHandler, IRunOptions } from '../lib/command';
import { handleProcessError, runProcess } from '../utils/process';
import { logErrorBold, Spinner } from '../utils/ui';
import { ensureDirectoryExists, packageRoot, runtimeRoot } from '../utils/path';
import { BundleRenderer, createBundleRenderer } from 'vue-server-renderer';
import * as fs from 'fs';
import { Config } from '../models/Config';

@Command({
  name: 'build',
  alias: 'b',
  description: 'Build project for production.',
  options: [
    { flags: '-a, --analyze', description: 'Analyze client bundle.' },
    { flags: '-spa, --spa', description: 'Build only client-side application and renders static HTML content.' },
    { flags: '-static, --static', description: 'Build only client-side application and renders static HTML content.' },
  ],
})
export class Build implements ICommandHandler {
  public analyze: boolean;
  public spa: boolean;
  public static: boolean;

  public async run(args: string[], options: IRunOptions) {
    process.env.NODE_ENV = 'production';

    try {
      await runProcess('rimraf', ['./dist'], { silent: true, ...options });
    } catch (e) {
      handleProcessError(e);
    }

    if (this.analyze) {
      analyze(options).catch((e) => logErrorBold(e));
    } else if (this.spa || this.static) {
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
      spinner.message = `Finished building universal application in ${Date.now() - startTime}ms`;
    } else {
      spinner.message = `Building universal application ${done}/3 ...`;
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
  spinner.message = `Analyzing application bundle...`;

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
  spinner.message = `Building client-side application and render static HTML...`;

  try {
    await Promise.all([runWebpack('isomorphic', options), runWebpack('spa', options)]);
    await renderPages(options);
  } catch (e) {
    handleProcessError(e, spinner);
  }

  spinner.message = `Production build finished in ${Date.now() - startTime}ms`;
  spinner.stop();
};

const renderPages = async (options: IRunOptions) => {
  const renderer: BundleRenderer = createBundleRenderer(runtimeRoot('dist/server/vue-ssr-bundle.json'), {
    template: fs.readFileSync(runtimeRoot('dist/client/index.html')).toString(),
  });
  const routes = (Config.spa && Config.spa.routesToRender) || ['/'];

  for (const route of routes) {
    const filename = route === '/' ? '/index.html' : `${route}.html`;
    const filePath = runtimeRoot(`dist${filename}`);
    const html = await renderer.renderToString({
      url: route,
      cookies: {},
      acceptLanguage: Config.i18n.defaultLocale,
      htmlLang: Config.i18n.defaultLocale.substr(0, 2),
      appConfig: {},
      redirect: null,
    });
    ensureDirectoryExists(filePath);
    fs.writeFileSync(filePath, html, 'utf-8');
  }

  await runProcess('rimraf', ['./dist/server', './dist/client/index.html', './dist/client/index.html.gz'], {
    silent: true,
    ...options,
  });
};
