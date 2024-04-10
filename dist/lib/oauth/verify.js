"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verify = void 0;
const payload_1 = __importDefault(require("payload"));
const types_1 = require("../../types");
const ERROR_USERINFO = new Error('FAILED TO GET USERINFO');
const ERROR_USER_DOES_NOT_EXIST = new Error('USER DOES NOT EXIST');
const verify = (opts) => async function (accessToken, refreshToken, profile, cb) {
    var _a, _b, _c, _d, _e;
    const collection = (_b = (_a = opts.userCollection) === null || _a === void 0 ? void 0 : _a.slug) !== null && _b !== void 0 ? _b : 'users';
    const searchKey = (_d = (_c = opts.userCollection) === null || _c === void 0 ? void 0 : _c.searchKey) !== null && _d !== void 0 ? _d : 'sub';
    const createUserIfNotFound = opts.createUserIfNotFound || false;
    try {
        const info = await ((_e = opts.userinfo) === null || _e === void 0 ? void 0 : _e.call(opts, accessToken));
        if (!info)
            cb(ERROR_USERINFO);
        const user = await findUser(collection, searchKey, info);
        if (user) {
            await updateUser(collection, searchKey, info);
            const updatedUser = await findUser(collection, searchKey, info);
            return cb(null, { ...updatedUser, collection, _strategy: types_1._strategy });
        }
        if (createUserIfNotFound) {
            const newUser = await createUser(collection, info);
            return cb(null, { ...newUser, collection, _strategy: types_1._strategy });
        }
        else {
            return cb(ERROR_USER_DOES_NOT_EXIST);
        }
    }
    catch (error) {
        return cb(error);
    }
};
exports.verify = verify;
const findUser = async (collection, searchKey, info) => {
    const where = { [searchKey]: { equals: info[searchKey] } };
    const users = await payload_1.default.find({
        collection,
        where,
    });
    if (!users.docs || !users.docs[0])
        return null;
    return users.docs && users.docs[0];
};
const updateUser = async (collection, searchKey, info) => {
    return await payload_1.default.update({
        collection,
        where: { [searchKey]: { equals: info[searchKey] } },
        data: { ...info },
    });
};
const createUser = async (collection, info) => {
    return await payload_1.default.create({
        collection,
        data: { ...info, password: (info === null || info === void 0 ? void 0 : info.password) || makeid(20) },
    });
};
const makeid = (length) => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
};
