import * as fs from 'fs';
import { sync } from 'glob';
import { runProcess, runtimeRoot, logError } from '@vuesion/utils';
import { VuesionWebpackConfig } from '@vuesion/models';

const cleanUp = async () => {
  await runProcess('npm', ['uninstall', '--save', '@vuesion/addon-tailwindcss'], { silent: true });
};

export default async () => {
  await runProcess('npm', ['install', '--save', 'tailwindcss'], { silent: true });

  VuesionWebpackConfig.addBlock(`  
  if (!target) {
    const postCssLoaderOptions = {
      ident: 'postcss',
      plugins: () => [
        require('tailwindcss'),
        require('autoprefixer')(),
        require('css-mqpacker')(),
        require('cssnano')({
          preset: [
            'default',
            {
              discardComments: {
                removeAll: true,
              },
              zindex: false,
              normalizeWhitespace: isProd,
            },
          ],
        }),
      ],
    };
    const scssRuleIndex = config.module.rules.findIndex((rule) => rule.test.toString() === '/\\.scss$/');
    const scssRule = config.module.rules[scssRuleIndex];

    scssRule.oneOf.forEach((ruleConfig) => {
      const postCssLoader = ruleConfig.use.find((loader) => loader.loader && loader.loader === 'postcss-loader');

      postCssLoader.options = postCssLoaderOptions;
    });
  }`);

  const globalScssMatch = sync(runtimeRoot('src/**/*global*.scss'));

  if (globalScssMatch.length === 0) {
    logError("You don't have a global.scss file!");
    return;
  }

  const globalScssPath = globalScssMatch[0];

  let globalScss = `@import '~tailwindcss/base';
@import '~tailwindcss/components';
@import '~tailwindcss/utilities';
`;

  globalScss += fs.readFileSync(globalScssPath, 'utf-8');

  fs.writeFileSync(globalScssPath, globalScss, 'utf-8');

  await cleanUp();
};
