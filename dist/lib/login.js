"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginHandler = exports.connectHandler = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const payload_1 = __importDefault(require("payload"));
const types_1 = require("payload/dist/fields/config/types");
const getCookieExpiration_1 = __importDefault(require("payload/dist/utilities/getCookieExpiration"));
const connectHandler = (opts, userCollectionSlug) => async (req, res) => {
    console.log(req.query);
    // If the query contain redirect_uri, save it to a temporary cookie
    if (req.query.redirect_uri) {
        res.cookie(opts.redirectUriCookieName || 'payload-connect-redirect-uri', req.query.redirect_uri, {
            path: '/',
            sameSite: 'strict',
        });
    }
    // Redirect to the OIDC provider
    return res.redirect(opts.initPath);
};
exports.connectHandler = connectHandler;
const loginHandler = (opts, userCollectionSlug) => async (req, res) => {
    var _a;
    // Get the Mongoose user
    const collectionConfig = payload_1.default.collections[userCollectionSlug].config;
    // Sanitize the user object
    // let user = userDoc.toJSON({ virtuals: true })
    let user = JSON.parse(JSON.stringify(req.user));
    // Decide which user fields to include in the JWT
    const fieldsToSign = getFieldsToSign(collectionConfig, user);
    // Sign the JWT
    const token = jsonwebtoken_1.default.sign(fieldsToSign, payload_1.default.secret, {
        expiresIn: collectionConfig.auth.tokenExpiration,
    });
    // Set cookie
    res.cookie(`${payload_1.default.config.cookiePrefix}-token`, token, {
        path: '/',
        httpOnly: true,
        expires: (0, getCookieExpiration_1.default)(collectionConfig.auth.tokenExpiration),
        secure: collectionConfig.auth.cookies.secure,
        sameSite: collectionConfig.auth.cookies.sameSite,
        domain: collectionConfig.auth.cookies.domain || undefined,
    });
    // Read the redirect_uri from the temporary cookie in the headers
    const headerCookie = req.headers.cookie;
    const cookieName = opts.redirectUriCookieName || 'payload-connect-redirect-uri';
    const redirectUri = (_a = headerCookie === null || headerCookie === void 0 ? void 0 : headerCookie.split(';').find((cookie) => cookie.includes(cookieName))) === null || _a === void 0 ? void 0 : _a.split('=')[1];
    if (redirectUri) {
        // Clear the temporary cookie
        res.clearCookie(cookieName, {
            path: '/',
        });
        const encodedURI = decodeURIComponent(redirectUri);
        console.log(encodedURI);
        // Redirect to the original URL
        return res.redirect(encodedURI);
    }
    // Redirect to admin dashboard
    return res.redirect('/admin');
};
exports.loginHandler = loginHandler;
const getFieldsToSign = (collectionConfig, user) => {
    return collectionConfig.fields.reduce((signedFields, field) => {
        const result = {
            ...signedFields,
        };
        if (!(0, types_1.fieldAffectsData)(field) && (0, types_1.fieldHasSubFields)(field)) {
            field.fields.forEach((subField) => {
                if ((0, types_1.fieldAffectsData)(subField) && subField.saveToJWT) {
                    result[subField.name] = user[subField.name];
                }
            });
        }
        if ((0, types_1.fieldAffectsData)(field) && field.saveToJWT) {
            result[field.name] = user[field.name];
        }
        return result;
    }, {
        email: user.email,
        id: user.id,
        collection: collectionConfig.slug,
    });
};
