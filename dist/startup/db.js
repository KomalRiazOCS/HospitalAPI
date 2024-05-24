"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
// startup/db.ts
const mongoose_1 = __importDefault(require("mongoose"));
function connectDB() {
    const db = process.env.DB_URL || 'mongodb://localhost/hospitalApi';
    mongoose_1.default.connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => console.log('Connected to MongoDB...'))
        .catch((err) => console.error('Could not connect to MongoDB...', err));
}
exports.connectDB = connectDB;
