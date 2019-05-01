import * as webpack from 'webpack';
import { merge, nodeExternals } from './utils';
import { baseServer } from './base-server';
import { packageRoot } from '../../utils/path';

export const devServer: webpack.Configuration = merge(baseServer, {
  name: 'devServer',
  entry: {
    'dev-server': packageRoot('dist/webpack/dev/server'),
  },
  output: {
    filename: 'dev-server.js',
  },
  externals: [nodeExternals()],
  node: {
    __dirname: true,
  },
}) as any;

export default devServer;
