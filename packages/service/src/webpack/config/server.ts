import * as webpack from 'webpack';
import { isDev, merge } from './utils';
import { baseServer } from './base-server';
import { runtimeRoot } from '../../utils/path';

const CopyWebpackPlugin = require('copy-webpack-plugin');
const StartServerPlugin = require('start-server-webpack-plugin');

export let server = merge(baseServer, {
  entry: [runtimeRoot('src/server/index')],
  output: {
    filename: 'server.js',
  },
  plugins: [
    new CopyWebpackPlugin([
      { from: runtimeRoot('src/static'), to: '../static' },
      { from: runtimeRoot('src/app/config/*.json'), to: 'app/config', flatten: true },
    ]),
  ],
});

if (isDev) {
  server = merge(server, {
    watch: true,
    entry: ['webpack/hot/poll?1000'],
    plugins: [
      new StartServerPlugin({
        name: 'server.js',
        nodeArgs: ['--inspect'],
      }),
      new webpack.HotModuleReplacementPlugin(),
    ],
  });
}

export default server;
