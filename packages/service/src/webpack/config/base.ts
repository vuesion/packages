import * as webpack from 'webpack';
import { analyze, isDev, isProd } from './utils';
import { packageRoot, runtimeRoot } from '../../utils/path';
import { getWebpackAliases } from '../../models/Config';

const { VueLoaderPlugin } = require('vue-loader');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

export let base: webpack.Configuration = {
  stats: {
    assets: true,
    children: true,
  },
  devtool: isProd ? false : '#eval-source-map',
  resolve: {
    extensions: ['.ts', '.js', '.vue', '.json', '.node'],
    modules: [
      runtimeRoot('src'),
      runtimeRoot('node_modules'),
      packageRoot('node_modules'),
      packageRoot('src/webpack/dev'),
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
        include: [runtimeRoot('src'), packageRoot('src/webpack/dev')],
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
        rules: [
          { loader: 'vue-style-loader' },
          {
            loader: 'css-loader',
            exclude: [/global\.scss/],
            options: {
              modules: true,
              importLoaders: 1,
              localIdentName: '[local]_[hash:base64:8]',
            },
          },
          {
            loader: 'css-loader',
            include: [/global\.scss/],
          },
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: () => [
                require('autoprefixer')({ browsers: ['last 2 versions', 'ie >= 11'] }),
                require('css-mqpacker')(),
                require('cssnano')({
                  discardComments: {
                    removeAll: true,
                  },
                  zindex: false,
                }),
              ],
            },
          },
          {
            loader: 'sass-loader',
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
    }),
  ],
};

if (analyze) {
  base.plugins.push(new BundleAnalyzerPlugin({ analyzerMode: 'static' }));
}

const aliases = getWebpackAliases();

if (aliases) {
  Object.keys(aliases).map((alias: string) => {
    base.resolve.alias[alias] = runtimeRoot(aliases[alias]);
  });
}

base = require(runtimeRoot('.vuesion/webpack.config'))(base);

export default base;
