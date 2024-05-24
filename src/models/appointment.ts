import mongoose, { Schema, Document } from 'mongoose';
import Joi from 'joi';

interface AppointmentDocument extends Document {
    startTime: Date;
    endTime: Date;
    description: string;
    feeStatus: 'USD' | 'EUR' | 'Bitcoin' | 'unpaid';
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
        enum: ['USD', 'EUR', 'Bitcoin', 'unpaid'],
        required: true
    },
    amount: {
        type: String,
        required: true
    }
});

const AppointmentDocument = mongoose.model<AppointmentDocument>('Appointment', appointmentSchema);

const validateAppointment = Joi.object().keys({
    startTime: Joi.date().required(),
    endTime: Joi.date().required(),
    description: Joi.string().required(),
    feeStatus: Joi.string().valid('USD', 'EUR', 'Bitcoin', 'unpaid').required(),
    amount: Joi.string().required()
    });

export { appointmentSchema, AppointmentDocument, validateAppointment };
