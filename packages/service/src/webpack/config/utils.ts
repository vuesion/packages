import * as webpackMerge from 'webpack-merge';
import * as externals from 'webpack-node-externals';

export const isProd = process.env.NODE_ENV === 'production';
export const isDev = process.env.NODE_ENV === 'development';
export const analyze = process.env.ANALYZE;
export const merge = webpackMerge;
export const nodeExternals = externals;
