"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extendWebpackConfig = void 0;
const extendWebpackConfig = (config) => (webpackConfig) => {
    var _a, _b;
    const existingWebpackConfig = typeof ((_a = config.admin) === null || _a === void 0 ? void 0 : _a.webpack) === 'function'
        ? config.admin.webpack(webpackConfig)
        : webpackConfig;
    const newWebpack = {
        ...existingWebpackConfig,
        resolve: {
            ...(existingWebpackConfig.resolve || {}),
            alias: {
                ...(((_b = existingWebpackConfig.resolve) === null || _b === void 0 ? void 0 : _b.alias) ? existingWebpackConfig.resolve.alias : {}),
                'express-session': false,
                'passport-oauth2': false,
                memorystore: false,
                jsonwebtoken: false,
                passport: false,
            },
        },
    };
    return newWebpack;
};
exports.extendWebpackConfig = extendWebpackConfig;
