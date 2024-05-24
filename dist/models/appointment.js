"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAppointment = exports.AppointmentDocument = exports.appointmentSchema = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const joi_1 = __importDefault(require("joi"));
const appointmentSchema = new mongoose_1.Schema({
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    feeStatus: {
        type: String,
        enum: ['USD', 'EUR', 'Bitcoin', 'unpaid'],
        required: true
    },
    amount: {
        type: String,
        required: true
    }
});
exports.appointmentSchema = appointmentSchema;
const AppointmentDocument = mongoose_1.default.model('Appointment', appointmentSchema);
exports.AppointmentDocument = AppointmentDocument;
const validateAppointment = joi_1.default.object().keys({
    startTime: joi_1.default.date().required(),
    endTime: joi_1.default.date().required(),
    description: joi_1.default.string().required(),
    feeStatus: joi_1.default.string().valid('USD', 'EUR', 'Bitcoin', 'unpaid').required(),
    amount: joi_1.default.string().required()
});
exports.validateAppointment = validateAppointment;
