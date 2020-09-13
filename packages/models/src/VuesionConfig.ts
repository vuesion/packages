import { JSONModel } from './JSONModel';
import { runtimeRoot } from '@vuesion/utils';
import { pathOr } from 'ramda';

interface IVuesionConfig extends Object {
  [key: string]: any;
  currentVersion: string;
  generators: {
    blueprintDirectory: string;
    outputDirectory: string;
    stateFile: string;
  };
  clean: string[];
  prettier: {
    extensions: string;
  };
}

class Model extends JSONModel<IVuesionConfig> implements IVuesionConfig {
  public clean: string[];
  public outputDirectory: string;
  public currentVersion: string;
  public devServer: { watchOptions: any };
  public generators: { blueprintDirectory: string; outputDirectory: string; stateFile: string };
  public i18n: { defaultLocale: string; supportedLocales: string[] };
  public prettier: { extensions: string };
  public spa: { appShellRoute: string; additionalRoutes: string[] };
  public webpack: { aliases: { [p: string]: string } };

  constructor() {
    super(runtimeRoot('.vuesion/config.json'));

    if (this.model !== null) {
      this.currentVersion = this.model.currentVersion;
      this.generators = this.model.generators;
      this.clean = this.model.clean;
      this.prettier = this.model.prettier;
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
