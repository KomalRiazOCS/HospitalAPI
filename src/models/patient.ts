import mongoose, { Schema, Document } from 'mongoose';
import { appointmentSchema, AppointmentDocument  } from './appointment';
import validatePatient from '../validations/patient';
import { PetType } from '../types/patient';

interface PatientDocument extends Document {
    petName: string;
    petType: PetType;
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
        enum: Object.values(PetType),
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

export { PatientDocument, patientSchema, Patient, validatePatient };
