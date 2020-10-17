import * as glob from 'glob';
import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';
import { getTranslationObject, getTranslationsFromString } from './Utils';
import { runtimeRoot } from '@vuesion/utils';
import { HeadLine, log, Result } from '@vuesion/utils/dist/ui';
import { ensureDirectoryExists } from '@vuesion/utils/dist/fileSystem';
import { sync } from 'rimraf';

function compile(fileNames: string[], options: ts.CompilerOptions): void {
  const program = ts.createProgram(fileNames, options);
  const emitResult = program.emit();
  const allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);

  allDiagnostics.forEach(() => null);
}

export const run = (): void => {
  compile([runtimeRoot('nuxt.config.ts')], {
    noEmitOnError: true,
    noImplicitAny: true,
    target: ts.ScriptTarget.ES5,
    module: ts.ModuleKind.CommonJS,
  });
  const NuxtConfig: any = require(runtimeRoot('nuxt.config.js')).default;

  glob('./src/**/*.*', (err: any, files: string[]) => {
    const basePath: string = path.resolve(process.cwd());
    const supportedLocales: string[] = NuxtConfig.i18n.locales.map((l: any) => l.code);
    const defaultLocale = NuxtConfig.i18n.defaultLocale;
    let translations: any = {};

    HeadLine('Scanning files in: ./src/**/*.*');

    log('');

    /**
     * go through all *.vue files end extract the translation object $t('foo') -> {id: 'foo'}
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
    supportedLocales.forEach((locale: string) => {
      const i18nFilePath: string = path.join(basePath, 'i18n', `${locale}.json`);
      const i18nFileContent: string = fs.existsSync(i18nFilePath) ? fs.readFileSync(i18nFilePath).toString() : null;
      const i18nFileObject: any = i18nFileContent ? JSON.parse(i18nFileContent) : {};

      (Object as any).keys(i18nFileObject).forEach((key: string) => {
        i18nFileObject[key] = i18nFileObject[key].replace(/\n/g, '\\n').replace(/"/g, '\\"');
      });

      const newI18nObject: any =
        locale === defaultLocale
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

      log(`Updated: ./i18n/${locale}.json.`);
    });

    log('');

    Result('I18n extraction finished.');

    sync(runtimeRoot('nuxt.config.js'));
  });
};
