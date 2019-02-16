import * as fs from 'fs';
import { runtimeRoot } from '../utils/path';

export interface IConfig {
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
  jest: any;
  clean: string[];
  currentVersion: string;
  prettier: {
    extensions: string;
  };
}

export const configPath: string = runtimeRoot('.vue-starter/config.json');

export let Config: IConfig;

if (fs.existsSync(configPath)) {
  Config = JSON.parse(fs.readFileSync(configPath).toString());
}
