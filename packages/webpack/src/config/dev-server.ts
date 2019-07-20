import * as webpack from 'webpack';
import { merge, nodeExternals } from './utils';
import { baseServer } from './base-server';
import { packagesRoot } from '@vuesion/utils/dist/path';

export const devServer: webpack.Configuration = merge(baseServer, {
  name: 'devServer',
  entry: {
    'dev-server': packagesRoot('webpack', 'dist/dev/server'),
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
