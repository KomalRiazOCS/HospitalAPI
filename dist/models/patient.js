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
exports.validatePatient = exports.Patient = exports.patientSchema = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const joi_1 = __importDefault(require("joi"));
const appointment_1 = require("./appointment");
const patientSchema = new mongoose_1.Schema({
    petName: {
        type: String,
        required: true
    },
    petType: {
        type: String,
        enum: ['cat', 'dog', 'bird'],
        required: true
    },
    ownerName: {
        type: String,
        required: true
    },
    ownerAddress: {
        type: String,
        required: true
    },
    ownerPhone: {
        type: String,
        required: true,
        minlength: 11
    },
    appointment: {
        type: [appointment_1.appointmentSchema]
    },
});
exports.patientSchema = patientSchema;
const Patient = mongoose_1.default.model('Patient', patientSchema);
exports.Patient = Patient;
const validatePatient = joi_1.default.object().keys({
    petName: joi_1.default.string().required(),
    petType: joi_1.default.string().valid('cat', 'dog', 'bird').required(),
    ownerName: joi_1.default.string().required(),
    ownerAddress: joi_1.default.string().required(),
    ownerPhone: joi_1.default.string().min(11).required(),
    // Assuming you also want to validate the appointment array
    appointmentid: joi_1.default.string().required
});
exports.validatePatient = validatePatient;
