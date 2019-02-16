import * as webpack from 'webpack';
import { merge, nodeExternals } from './utils';
import { base } from './base';
import { runtimeRoot } from '../../utils/path';

export let baseServer: webpack.Configuration = merge(base, {
  target: 'node',
  output: {
    path: runtimeRoot('dist/server'),
    libraryTarget: 'commonjs',
  },
  externals: [
    nodeExternals({
      whitelist: ['webpack/hot/poll?1000'],
    }),
  ],
  plugins: [
    new webpack.DefinePlugin({
      CLIENT: false,
      SERVER: true,
      nodeRequire: 'function(module){return require(module);}',
    }),
  ],
  node: {
    __dirname: false,
    __filename: false,
  },
}) as any;

baseServer = require(runtimeRoot('.vuesion/webpack.config'))(baseServer, 'server');

export default baseServer;
