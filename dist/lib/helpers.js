"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCallbackPath = void 0;
const getCallbackPath = (opts) => {
    return (opts.callbackPath ||
        (opts.callbackURL && new URL(opts.callbackURL).pathname) ||
        '/oidc/callback');
};
exports.getCallbackPath = getCallbackPath;
