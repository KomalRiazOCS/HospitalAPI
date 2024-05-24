"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureProd = void 0;
const compression_1 = __importDefault(require("compression"));
const helmet_1 = __importDefault(require("helmet"));
function configureProd(app) {
    app.use((0, helmet_1.default)());
    app.use((0, compression_1.default)());
}
exports.configureProd = configureProd;
