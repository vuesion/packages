import * as webpack from 'webpack';
import { merge, nodeExternals } from './utils';
import { baseServer } from './base-server';
import { runtimeRoot } from '@vuesion/utils/dist/path';

const VueSSRPlugin = require('vue-ssr-webpack-plugin');

export const isomorphic: webpack.Configuration = merge(baseServer, {
  name: 'isomorphic',
  entry: { isomorphic: runtimeRoot('src/server/isomorphic') },
  output: {
    filename: 'isomorphic.js',
    libraryTarget: 'commonjs2',
  },
  externals: [nodeExternals()],
  plugins: [new VueSSRPlugin({})],
}) as any;

export default isomorphic;
