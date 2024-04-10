import { VerifyCallback } from 'passport-oauth2';
import { oidcPluginOptions } from '../../types';
export declare const verify: (opts: oidcPluginOptions) => (accessToken: string, refreshToken: string, profile: {}, cb: VerifyCallback) => Promise<void>;
