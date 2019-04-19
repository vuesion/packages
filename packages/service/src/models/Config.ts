import * as fs from 'fs';
import { runtimeRoot } from '../utils/path';
import { pathOr } from 'ramda';

export interface IConfig {
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
}

export const configPath: string = runtimeRoot('.vuesion/config.json');

export let Config: IConfig;

export const getWebpackAliases = () => pathOr(null, ['webpack', 'aliases'], Config);

if (fs.existsSync(configPath)) {
  Config = JSON.parse(fs.readFileSync(configPath).toString());
}
