import { JSONModel } from './JSONModel';
import { runtimeRoot } from '@vuesion/utils';

interface IVuesionConfig extends Object {
  [key: string]: any;
  currentVersion: string;
  generators: {
    blueprintDirectory: string;
    outputDirectory: string;
    stateFile: string;
  };
  clean: string[];
  prettier: { extensions: string };
  i18n: { defaultLocale: string; locales: Array<{ code: string; file: string }> };
}

class Model extends JSONModel<IVuesionConfig> implements IVuesionConfig {
  public currentVersion: string;
  public generators: { blueprintDirectory: string; outputDirectory: string; stateFile: string };
  public clean: string[];
  public prettier: { extensions: string };
  public i18n: { defaultLocale: string; locales: Array<{ code: string; file: string }> };

  constructor() {
    super(runtimeRoot('.vuesion/config.json'));

    if (this.model !== null) {
      this.currentVersion = this.model.currentVersion;
      this.generators = this.model.generators;
      this.clean = this.model.clean;
      this.prettier = this.model.prettier;
      this.i18n = this.model.i18n;
    }
  }

  public updateCurrentVersion(currentVersion: string) {
    this.model.currentVersion = currentVersion;

    this.save();
  }
}

export const VuesionConfig = new Model();
