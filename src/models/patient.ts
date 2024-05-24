import mongoose, { Schema, Document } from 'mongoose';
import Joi from 'joi';
import { appointmentSchema, AppointmentDocument  } from './appointment';

interface PatientDocument extends Document {
    petName: string;
    petType: 'cat' | 'dog' | 'bird';
    ownerName: string;
    ownerAddress: string;
    ownerPhone: string;
    appointment: AppointmentDocument[];
}

const patientSchema: Schema<PatientDocument> = new Schema({
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
        type: [appointmentSchema]
    },
});

const Patient = mongoose.model<PatientDocument>('Patient', patientSchema);

const validatePatient = Joi.object().keys({
    petName: Joi.string().required(),
        petType: Joi.string().valid('cat', 'dog', 'bird').required(),
        ownerName: Joi.string().required(),
        ownerAddress: Joi.string().required(),
        ownerPhone: Joi.string().min(11).required(),
        // Assuming you also want to validate the appointment array
        appointmentid: Joi.string().required
    });

export { patientSchema, Patient, validatePatient };
