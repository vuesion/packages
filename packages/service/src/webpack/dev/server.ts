import * as Express from 'express';
import { WebpackDevMiddleware } from 'webpack-dev-middleware';
import { Config } from '../../models/Config';

const path = require('path');
const webpack = require('webpack');
const MFS = require('memory-fs');
const clientConfig = nodeRequire(path.resolve(__dirname, '../config/client')).default;
const isomorphicConfig = nodeRequire(path.resolve(__dirname, '../config/isomorphic')).default;

let initialized: boolean = false;
let devMiddleware: WebpackDevMiddleware;
let clientCompiler: any;
let bundle: string;
let template: string;

export default (app: Express.Application, callback: any): void => {
  /**
   * Code for hot-reloading
   * ----------------------
   * The dev server and the webpack compilers should just be initialized once.
   * But the middlewares have to be applied every time a new app is loaded.
   */
  if (initialized) {
    app.use(devMiddleware as any);
    app.use(require('webpack-hot-middleware')(clientCompiler));

    if (bundle && template) {
      callback(bundle, template);
    }
    return;
  }

  clientConfig.entry = ['webpack-hot-middleware/client', clientConfig.entry.app];
  clientConfig.output.filename = '[name].js';
  clientConfig.plugins.push(new webpack.HotModuleReplacementPlugin());
  clientConfig.mode = 'development';

  clientCompiler = webpack(clientConfig);
  devMiddleware = require('webpack-dev-middleware')(clientCompiler, {
    publicPath: clientConfig.output.publicPath,
    stats: {
      colors: true,
      chunks: false,
    },
    watchOptions: (Config.devServer && Config.devServer.watchOptions) || {
      aggregateTimeout: 300,
      poll: false,
    },
  });

  app.use(devMiddleware as any);

  clientCompiler.hooks.done.tap('dev-server', () => {
    const fs: any = devMiddleware.fileSystem;
    const templatePath: string = path.join(clientConfig.output.path, 'index.html');

    if (fs.existsSync(templatePath)) {
      template = fs.readFileSync(templatePath, 'utf-8');

      if (bundle) {
        callback(bundle, template);
      }
    }
  });

  app.use(require('webpack-hot-middleware')(clientCompiler));

  isomorphicConfig.mode = 'development';

  const serverCompiler: any = webpack(isomorphicConfig);
  const mfs: any = new MFS();

  serverCompiler.outputFileSystem = mfs;
  serverCompiler.watch({}, (err: any, stats: any) => {
    if (err) {
      throw err;
    }
    stats = stats.toJson();
    stats.errors.forEach((e: any) => console.log(JSON.stringify(err, Object.getOwnPropertyNames(e)))); // tslint:disable-line
    stats.warnings.forEach((e: any) => console.log(JSON.stringify(err, Object.getOwnPropertyNames(e)))); // tslint:disable-line

    const bundlePath: string = path.join(isomorphicConfig.output.path, 'vue-ssr-bundle.json');

    bundle = JSON.parse(mfs.readFileSync(bundlePath, 'utf-8'));

    if (template) {
      callback(bundle, template);
    }
  });

  initialized = true;
};
