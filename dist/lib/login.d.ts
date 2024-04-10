import { Response } from 'express';
import type { oidcPluginOptions } from '../types';
import { PayloadRequest } from 'payload/types';
export declare const connectHandler: (opts: oidcPluginOptions, userCollectionSlug: string) => (req: PayloadRequest, res: Response) => Promise<void>;
export declare const loginHandler: (opts: oidcPluginOptions, userCollectionSlug: string) => (req: PayloadRequest, res: Response) => Promise<void>;
