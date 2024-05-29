import mongoose, { Schema, Document } from 'mongoose';
import { FeeStatus } from '../types/appointment';
import validateAppointment from '../validations/appointment';

interface AppointmentDocument extends Document {
    startTime: Date;
    endTime: Date;
    description: string;
    feeStatus: FeeStatus;
    amount: string;
}

const appointmentSchema: Schema<AppointmentDocument> = new Schema({
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
        enum: Object.values(FeeStatus),
        required: true
    },
    amount: {
        type: String,
        required: true
    }
});

const Appointment = mongoose.model<AppointmentDocument>('Appointment', appointmentSchema);

export { appointmentSchema, AppointmentDocument, Appointment,  validateAppointment };
