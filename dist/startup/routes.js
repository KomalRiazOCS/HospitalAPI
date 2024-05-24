"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureRoutes = void 0;
// startup/routes.ts
const express_1 = __importDefault(require("express"));
const patient_1 = __importDefault(require("../routes/patient"));
function configureRoutes(app) {
    app.use(express_1.default.json());
    app.use('/api/patient', patient_1.default);
}
exports.configureRoutes = configureRoutes;
