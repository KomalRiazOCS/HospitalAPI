"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeValidation = void 0;
const celebrate_1 = require("celebrate");
function initializeValidation(app) {
    app.use((0, celebrate_1.errors)());
}
exports.initializeValidation = initializeValidation;
