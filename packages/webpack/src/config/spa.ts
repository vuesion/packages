import * as webpack from 'webpack';
import { client } from './client';
import { merge } from './utils';
import { runtimeRoot } from '@vuesion/utils/dist/path';

const CopyWebpackPlugin = require('copy-webpack-plugin');

client.plugins.unshift(new webpack.DefinePlugin({ CLIENT: true, SERVER: false, TEST: false, SPA: true }));

client.output.path = runtimeRoot('dist');
client.output.publicPath = '/';

export const spa: webpack.Configuration = merge(client, {
  name: 'spa',
  plugins: [
    new CopyWebpackPlugin([
      { from: runtimeRoot('src/static'), to: './' },
      { from: runtimeRoot('i18n'), to: './i18n' },
    ]),
  ],
});

export default spa;
