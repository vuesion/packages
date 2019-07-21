import * as webpack from 'webpack';
import { analyze, isDev, isProd, statsSettings } from './utils';
import { packagesRoot, runtimeRoot } from '@vuesion/utils/dist/path';
import { VuesionConfig } from '@vuesion/models';

const { VueLoaderPlugin } = require('vue-loader');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

export let base: webpack.Configuration = {
  stats: statsSettings,
  devtool: isProd ? false : '#eval-source-map',
  resolve: {
    extensions: ['.ts', '.js', '.vue', '.json', '.node'],
    modules: [
      runtimeRoot('src'),
      runtimeRoot('node_modules'),
      packagesRoot('service', 'node_modules'),
      packagesRoot('service', 'src/webpack/dev'),
    ],
    alias: {
      vue$: 'vue/dist/vue.esm.js',
      '@': runtimeRoot('src'),
    },
  },
  module: {
    exprContextCritical: false,
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        include: [runtimeRoot('src'), packagesRoot('service', 'src/webpack/dev')],
        exclude: /node_modules/,
        options: {
          appendTsSuffixTo: [/\.vue$/],
          transpileOnly: true,
        },
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
      {
        test: /\.scss$/,
        oneOf: [
          {
            resourceQuery: /module/,
            use: [
              'vue-style-loader',
              {
                loader: 'css-loader',
                options: {
                  modules: true,
                },
              },
              {
                loader: 'postcss-loader',
                options: {
                  ident: 'postcss',
                  plugins: () => [
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
                },
              },
              'sass-loader',
            ],
          },
          {
            use: [
              'vue-style-loader',
              'css-loader',
              {
                loader: 'postcss-loader',
                options: {
                  ident: 'postcss',
                  plugins: () => [
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
                },
              },
              'sass-loader',
            ],
          },
        ],
      },
      {
        test: /\.(?:jpg|png|svg|ttf|woff2?|eot|ico)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]?[hash]',
        },
      },
      {
        test: /\.css$/,
        loader: ['vue-style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new VueLoaderPlugin(),
    new webpack.DefinePlugin({ PRODUCTION: isProd, DEVELOPMENT: isDev, TEST: false, SPA: false }),
    new ForkTsCheckerWebpackPlugin({
      tsconfig: runtimeRoot('tsconfig.json'),
      tslint: runtimeRoot('tslint.json'),
      vue: true,
      silent: true,
    }),
  ],
};

if (analyze) {
  base.plugins.push(new BundleAnalyzerPlugin({ analyzerMode: 'static' }));
}

const aliases = VuesionConfig.getWebpackAliases();

if (aliases) {
  Object.keys(aliases).map((alias: string) => {
    base.resolve.alias[alias] = runtimeRoot(aliases[alias]);
  });
}

export default VuesionConfig.getCustomWebpackConfig(base);
