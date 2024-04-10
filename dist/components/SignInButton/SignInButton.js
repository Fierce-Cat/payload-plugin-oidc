"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Button_1 = __importDefault(require("payload/dist/admin/components/elements/Button"));
const react_1 = __importDefault(require("react"));
function SignInButton() {
    return (react_1.default.createElement("div", { style: { width: '100%', textAlign: 'center' } },
        react_1.default.createElement("h4", { style: { marginBottom: 0 } }, "Deliverback Content"),
        react_1.default.createElement(Button_1.default, { className: "SignInButton", el: "anchor", url: "/oidc/signin" }, "Sign in with your identity")));
}
exports.default = SignInButton;
