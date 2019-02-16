import * as webpack from 'webpack';
import { client } from './client';
import { merge } from './utils';
import { runtimeRoot } from '../../utils/path';

const HTMLPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

client.plugins.unshift(new webpack.DefinePlugin({ CLIENT: true, SERVER: false, TEST: true }));

export const spa: webpack.Configuration = merge(client, {
  plugins: [
    new HTMLPlugin({
      filename: '../index.html',
      template: runtimeRoot('src/index.template.html'),
      spa: true,
    }),
    new CopyWebpackPlugin([
      { from: runtimeRoot('src/static'), to: '../' },
      { from: runtimeRoot('i18n'), to: '../i18n' },
      { from: runtimeRoot('src/static/logo.png'), to: '../favicon.png' },
    ]),
  ],
});

export default spa;
