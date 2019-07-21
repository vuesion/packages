import { JSONModel } from './JSONModel';
import { runtimeRoot } from '@vuesion/utils';
import { pathOr } from 'ramda';

interface IVuesionConfig extends Object {
  currentVersion: string;
  generators: {
    blueprintDirectory: string;
    outputDirectory: string;
    routerFile: string;
    stateFile: string;
  };
  i18n: {
    defaultLocale: string;
    supportedLocales: string[];
  };
  clean: string[];
  prettier: {
    extensions: string;
  };
  webpack: {
    aliases: { [key: string]: string };
  };
  spa: {
    appShellRoute: string;
    additionalRoutes: string[];
  };
  devServer: {
    watchOptions: any;
  };
}

class Model extends JSONModel<IVuesionConfig> implements IVuesionConfig {
  public clean: string[];
  public currentVersion: string;
  public devServer: { watchOptions: any };
  public generators: { blueprintDirectory: string; outputDirectory: string; routerFile: string; stateFile: string };
  public i18n: { defaultLocale: string; supportedLocales: string[] };
  public prettier: { extensions: string };
  public spa: { appShellRoute: string; additionalRoutes: string[] };
  public webpack: { aliases: { [p: string]: string } };

  constructor() {
    super(runtimeRoot('.vuesion/config.json'));

    if (this.model !== null) {
      this.clean = this.model ? this.model.clean : [];
      this.currentVersion = this.model ? this.model.currentVersion : '';
      this.devServer = this.model
        ? this.model.devServer
        : {
            watchOptions: {
              aggregateTimeout: 300,
              poll: false,
            },
          };
      this.generators = this.model
        ? this.model.generators
        : {
            blueprintDirectory: './.vuesion/generators',
            outputDirectory: './src/app',
            routerFile: './src/app/router.ts',
            stateFile: './src/app/state.ts',
          };
      this.i18n = this.model
        ? this.model.i18n
        : {
            defaultLocale: 'en',
            supportedLocales: ['en', 'de', 'pt', 'zh-cn'],
          };
      this.prettier = this.model
        ? this.model.prettier
        : {
            extensions: 'ts,vue,js,json,scss,sass,css,yaml,yml',
          };
      this.spa = this.model
        ? this.model.spa
        : {
            appShellRoute: '/',
            additionalRoutes: ['/form'],
          };
      this.webpack = this.model
        ? this.model.webpack
        : {
            aliases: {
              '@': 'src',
              '@shared': 'src/app/shared',
              '@components': 'src/app/shared/components',
              '@static': 'src/static',
            },
          };
    }
  }

  public getWebpackAliases() {
    return pathOr(null, ['aliases'], this.webpack);
  }

  public updateCurrentVersion(currentVersion: string) {
    this.model.currentVersion = currentVersion;

    this.save();
  }

  public getCustomWebpackConfig(config: any, target?: string) {
    return require(runtimeRoot('.vuesion/webpack.config'))(config, target);
  }
}

export const VuesionConfig = new Model();
