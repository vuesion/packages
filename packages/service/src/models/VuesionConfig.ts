import { JSONModel } from './JSONModel';
import { runtimeRoot } from '../utils/path';
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

    this.clean = this.model.clean;
    this.currentVersion = this.model.currentVersion;
    this.devServer = this.model.devServer;
    this.generators = this.model.generators;
    this.i18n = this.model.i18n;
    this.prettier = this.model.prettier;
    this.spa = this.model.spa;
    this.webpack = this.model.webpack;
  }

  public getWebpackAliases() {
    return pathOr(null, ['aliases'], this.webpack);
  }

  public updateCurrentVersion(currentVersion: string) {
    this.model.currentVersion = currentVersion;

    this.save();
  }
}

export const VuesionConfig = new Model();
