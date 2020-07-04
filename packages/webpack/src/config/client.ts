import * as webpack from 'webpack';
import { isProd, merge } from './utils';
import { base } from './base';
import { runtimeRoot } from '@vuesion/utils/dist/path';
import { VuesionConfig } from '@vuesion/models';

const HTMLPlugin = require('html-webpack-plugin');
const ServiceWorkerWebpackPlugin = require('serviceworker-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');

export const client: webpack.Configuration = merge(base, {
  name: 'client',
  entry: {
    app: runtimeRoot('src/client/index'),
  },
  output: {
    path: runtimeRoot(`${VuesionConfig.outputDirectory}/client`),
    filename: '[name].[chunkHash].js',
    publicPath: '/client/',
    chunkFilename: '[name].[id].[chunkhash].js',
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          chunks: 'all',
        },
      },
    },
    runtimeChunk: 'single',
  },
  plugins: [
    new webpack.DefinePlugin({ CLIENT: true, SERVER: false }),
    new HTMLPlugin({ template: runtimeRoot('src/index.template.html'), spa: false }),
  ],
}) as any;

if (isProd) {
  client.plugins = (client.plugins || []).concat([
    new ServiceWorkerWebpackPlugin({ entry: runtimeRoot('src/client/sw.ts') }),
    new CompressionPlugin({ algorithm: 'gzip', test: /\.js$|\.css$|\.html$/, threshold: 0, minRatio: 1 }),
  ]);
}

export default client;
