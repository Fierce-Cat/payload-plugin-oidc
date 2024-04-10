"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.oidcPlugin = void 0;
const express_session_1 = __importDefault(require("express-session"));
const passport_1 = __importDefault(require("passport"));
const passport_oauth2_1 = __importDefault(require("passport-oauth2"));
const payload_1 = __importDefault(require("payload"));
const SignInButton_1 = __importDefault(require("./components/SignInButton/SignInButton"));
const login_1 = require("./lib/login");
const verify_1 = require("./lib/oauth/verify");
const webpack_1 = require("./lib/webpack");
const helpers_1 = require("./lib/helpers");
const memorystore_1 = __importDefault(require("memorystore"));
// Detect client side because some dependencies may be nullified
const isUI = typeof express_session_1.default !== 'function';
const oidcPlugin = (opts) => (incomingConfig) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    let config = { ...incomingConfig };
    const buttonComponentPosition = (_b = (_a = opts.components) === null || _a === void 0 ? void 0 : _a.position) !== null && _b !== void 0 ? _b : "beforeLogin";
    let componentConfigs = ((_d = (_c = config.admin) === null || _c === void 0 ? void 0 : _c.components) === null || _d === void 0 ? void 0 : _d.beforeLogin) || [];
    if (buttonComponentPosition == "afterLogin") {
        componentConfigs = ((_f = (_e = config.admin) === null || _e === void 0 ? void 0 : _e.components) === null || _f === void 0 ? void 0 : _f.afterLogin) || [];
    }
    config.admin = {
        ...(config.admin || {}),
        webpack: (0, webpack_1.extendWebpackConfig)(incomingConfig),
        components: {
            ...(((_g = config.admin) === null || _g === void 0 ? void 0 : _g.components) || {}),
            [buttonComponentPosition]: [
                ...(componentConfigs || []),
                (_j = (_h = opts.components) === null || _h === void 0 ? void 0 : _h.Button) !== null && _j !== void 0 ? _j : SignInButton_1.default
            ]
        }
    };
    if (isUI)
        return config;
    const userCollectionSlug = ((_k = opts.userCollection) === null || _k === void 0 ? void 0 : _k.slug) || 'users';
    const callbackPath = (0, helpers_1.getCallbackPath)(opts);
    const MemoryStore = (0, memorystore_1.default)(express_session_1.default);
    config.endpoints = [
        ...(config.endpoints || []),
        {
            path: opts.connectPath || '/oidc/connect',
            method: 'get',
            root: true,
            handler: (0, login_1.connectHandler)(opts, userCollectionSlug),
        },
        {
            path: opts.initPath,
            method: 'get',
            root: true,
            handler: passport_1.default.authenticate('oauth2'),
        },
        {
            path: callbackPath,
            method: 'get',
            root: true,
            handler: (0, express_session_1.default)({
                resave: false,
                saveUninitialized: false,
                secret: process.env.PAYLOAD_SECRET || 'unsafe',
                store: new MemoryStore({
                    checkPeriod: 86400000, // prune expired entries every 24h
                }),
            }),
        },
        {
            path: callbackPath,
            method: 'get',
            root: true,
            handler: passport_1.default.authenticate('oauth2', { failureRedirect: '/' }),
        },
        {
            path: callbackPath,
            method: 'get',
            root: true,
            handler: (0, login_1.loginHandler)(opts, userCollectionSlug),
        },
    ];
    passport_1.default.use(new passport_oauth2_1.default(opts, (0, verify_1.verify)(opts)));
    passport_1.default.serializeUser((user, done) => done(null, user.id));
    passport_1.default.deserializeUser(async (id, done) => {
        const user = await payload_1.default.findByID({
            collection: userCollectionSlug,
            id,
        });
        done(null, user);
    });
    return config;
};
exports.oidcPlugin = oidcPlugin;
