import * as fs from 'fs';
import { BundleRenderer, createBundleRenderer } from 'vue-server-renderer';
import { pathOr } from 'ramda';
import { Command, ICommandHandler, IRunOptions } from '../decorators/command';
import { handleProcessError, runProcess } from '@vuesion/utils/dist/process';
import { logInfo, logInfoBold, Spinner } from '@vuesion/utils/dist/ui';
import { packagesRoot, runtimeRoot } from '@vuesion/utils/dist/path';
import { ensureDirectoryExists } from '@vuesion/utils/dist/fileSystem';
import { sync } from 'rimraf';
import { VuesionConfig } from '@vuesion/models';

@Command({
  name: 'build',
  alias: 'b',
  description: 'Build project for production.',
  options: [
    { flags: '-a, --analyze', description: 'Analyze client bundle.' },
    { flags: '-spa, --spa', description: 'Build only client-side application and renders static HTML content.' },
  ],
})
export class Build implements ICommandHandler {
  public analyze: boolean;
  public spa: boolean;

  public async run(args: string[], options: IRunOptions) {
    process.env.NODE_ENV = 'production';

    sync('./dist');

    if (this.analyze) {
      analyze(options);
    } else if (this.spa) {
      spa(options);
    } else {
      build(options);
    }
  }
}

const runWebpack = (configName: string, options: IRunOptions) => {
  const configPath = packagesRoot('webpack', `dist/config/${configName}.js`);

  return runProcess(
    'node',
    [packagesRoot('webpack', 'dist/scripts/run-webpack.js'), configPath, 'production', `${options.debug}`],
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

const renderPage = async (renderer: BundleRenderer, route: string) => {
  return renderer.renderToString({
    url: route,
    cookies: {},
    acceptLanguage: VuesionConfig.i18n.defaultLocale,
    htmlLang: VuesionConfig.i18n.defaultLocale.substr(0, 2),
    appConfig: {},
    redirect: null,
  });
};

const spaCleanUp = async (options: IRunOptions) => {
  await runProcess('rimraf', ['./dist/server'], {
    silent: true,
    ...options,
  });
};

const renderPages = async (options: IRunOptions) => {
  const renderer: BundleRenderer = createBundleRenderer(runtimeRoot('dist/server/vue-ssr-bundle.json'), {
    template: fs.readFileSync(runtimeRoot('dist/index.html')).toString(),
  });
  const appShellRoute: string = pathOr<string>('/', ['spa', 'appShellRoute'], VuesionConfig);
  const routes: string[] = pathOr<string[]>([], ['spa', 'additionalRoutes'], VuesionConfig);

  routes.unshift(appShellRoute);

  for (const route of routes) {
    const filename = route === appShellRoute ? '/index.html' : `${route}.html`;
    const filePath = runtimeRoot(`dist${filename}`);

    try {
      const html = await renderPage(renderer, route);

      ensureDirectoryExists(filePath);
      fs.writeFileSync(filePath, html, 'utf-8');
    } catch (e) {
      e.route = route;
      throw e;
    }
  }

  await spaCleanUp(options);
};

const handleRenderError = (e: any, spinner: Spinner) => {
  spinner.stop(true);

  logInfoBold(`Error during rendering ${e.route}`);

  if (e.code && e.code === 302) {
    logInfo('This route probably has a route guard and can not be rendered to static HTML.');
  } else if (e.code && e.code === 404) {
    logInfo('This route does not exist and can not be rendered to static HTML.');
  } else {
    logInfo(e.message);
  }
};

const spa = async (options: IRunOptions) => {
  const startTime: number = Date.now();
  const spinner = new Spinner();

  spinner.start(options.debug);
  spinner.message = `Building client-side application and render static HTML...`;

  try {
    await Promise.all([runWebpack('isomorphic', options), runWebpack('spa', options)]);
  } catch (e) {
    handleProcessError(e, spinner);
    return;
  }

  try {
    spinner.message = `Rendering static HTML...`;
    await renderPages(options);
  } catch (e) {
    handleRenderError(e, spinner);
    return;
  }

  spinner.message = `Production build finished in ${Date.now() - startTime}ms`;
  spinner.stop();
};
