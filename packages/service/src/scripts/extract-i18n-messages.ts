import * as glob from 'glob';
import * as fs from 'fs';
import * as path from 'path';
import { getTranslationObject, getTranslationsFromString } from './Utils';
import { logError, logErrorBold, runtimeRoot } from '@vuesion/utils';
import { HeadLine, log, Result } from '@vuesion/utils/dist/ui';
import { ensureDirectoryExists } from '@vuesion/utils/dist/fileSystem';
import { sync } from 'rimraf';
import { VuesionConfig } from '@vuesion/models';

export const run = (): void => {
  if (!VuesionConfig.i18n) {
    logErrorBold(`Please add the i18n property to ./.vuesion/config.json
example:`);
    logError(`"i18n": {
  "locales": [
    {
      "code": "en", 
      "file": "en.json"
    }
  ],
  "defaultLocale": "en"
}`);

    return;
  }

  glob('./src/**/*.*', (err: any, files: string[]) => {
    const basePath: string = path.resolve(process.cwd());
    const locales = VuesionConfig.i18n.locales;
    const defaultLocale = VuesionConfig.i18n.defaultLocale;
    let translations: any = {};

    HeadLine('Scanning files in: ./src/**/*.*');

    log('');

    /**
     * go through all files and extract the translation object $t('foo') -> {id: 'foo'}
     */
    files.forEach((file: string) => {
      const content = fs.readFileSync(file).toString();
      const matches: string[] = getTranslationsFromString(content);

      if (matches) {
        translations = { ...translations, ...getTranslationObject(matches) };
      }
    });

    /**
     * analyze and write languages files
     */
    locales.forEach((locale) => {
      const i18nFilePath: string = path.join(basePath, 'i18n', `${locale.file}`);
      const i18nFileContent: string = fs.existsSync(i18nFilePath) ? fs.readFileSync(i18nFilePath).toString() : null;
      const i18nFileObject: any = i18nFileContent ? JSON.parse(i18nFileContent) : {};

      (Object as any).keys(i18nFileObject).forEach((key: string) => {
        i18nFileObject[key] = i18nFileObject[key].replace(/\n/g, '\\n').replace(/"/g, '\\"');
      });

      const newI18nObject: any =
        locale.code === defaultLocale
          ? (Object as any).assign({}, i18nFileObject, translations)
          : (Object as any).assign({}, translations, i18nFileObject);

      /**
       * sort entries
       */
      const sortedKeys: string[] = (Object as any).keys(newI18nObject).sort();
      const sortedEntries: string[] = sortedKeys.map((key: string) => {
        return `"${key}": "${newI18nObject[key]}"`;
      });

      ensureDirectoryExists(i18nFilePath);

      fs.writeFileSync(i18nFilePath, `{\n  ${sortedEntries.join(',\n  ')}\n}\n`);

      log(`Updated locale ${locale.code}: ./i18n/${locale.file}.`);
    });

    log('');

    Result('I18n extraction finished.');

    sync(runtimeRoot('nuxt.config.js'));
  });
};
