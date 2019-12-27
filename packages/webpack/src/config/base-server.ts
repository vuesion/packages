import * as webpack from 'webpack';
import { merge, nodeExternals } from './utils';
import { base } from './base';
import { runtimeRoot } from '@vuesion/utils/dist/path';
import { VuesionConfig } from '@vuesion/models';

export const baseServer: webpack.Configuration = merge(base, {
  target: 'node',
  output: {
    path: runtimeRoot(`${VuesionConfig.outputDirectory}/server`),
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

export default VuesionConfig.getCustomWebpackConfig(baseServer, 'server');
