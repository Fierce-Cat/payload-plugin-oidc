import type { Config } from 'payload/config';
import type { oidcPluginOptions } from './types';
export declare const oidcPlugin: (opts: oidcPluginOptions) => (incomingConfig: Config) => Config;
