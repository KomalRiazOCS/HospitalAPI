"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = void 0;
const express_1 = __importDefault(require("express"));
const db_1 = require("./startup/db");
const configuration_1 = require("./startup/configuration");
const prod_1 = require("./startup/prod");
const routes_1 = require("./startup/routes");
const app = (0, express_1.default)();
(0, configuration_1.configureApp)(app);
(0, db_1.connectDB)();
(0, prod_1.configureProd)(app);
(0, routes_1.configureRoutes)(app);
const port = process.env.PORT || 3000;
const server = app.listen(port, () => console.log(`Listening on port ${port}...`));
exports.server = server;
