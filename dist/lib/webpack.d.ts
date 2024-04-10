import type { Config } from 'payload/config';
import type { Configuration as WebpackConfig } from 'webpack';
export declare const extendWebpackConfig: (config: Config) => (webpackConfig: WebpackConfig) => WebpackConfig;
