import express, { Request, Response } from 'express';
import validateObjectId from '../helper/validateObjectId';
import { Appointment, AppointmentDocument, validateAppointment } from '../models/appointment';
import { PatientDocument } from '../models/patient';
import {
    savePatient,
    aggregateFinancialSummary,
    aggregatePetSummary
} from '../repository/appointment';

import { 
    findAllPatients, 
    findPatientById, 
} from '../repository/patient';

const router = express.Router();

router.post('/:id', validateObjectId, async (req: Request, res: Response) => {
    const patient: PatientDocument | null = await findPatientById(req.params.id);
    if (!patient) return res.status(404).send('The patient with the given ID was not found.');

    const { error } = validateAppointment.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const { startTime, endTime, description, feeStatus, amount } = req.body;

    let appointment: AppointmentDocument = new Appointment({
        startTime,
        endTime,
        description,
        feeStatus,
        amount
    });

    patient.appointment.push(appointment);
    await savePatient(patient);

    res.send(patient);
});

router.get('/:id', validateObjectId, async (req: Request, res: Response) => {
    const patient: PatientDocument | null = await findPatientById(req.params.id);
    if (!patient) return res.status(404).send('The patient with the given ID was not found.');

    res.send(patient.appointment);
});

router.put('/:id/:appointmentId', validateObjectId, async (req: Request, res: Response) => {
    const patient: PatientDocument | null = await findPatientById(req.params.id);
    if (!patient) return res.status(404).send('The patient with the given ID was not found.');

    const appointment: AppointmentDocument | undefined = patient.appointment.find(app => app._id.toString() === req.params.appointmentId);
    if (!appointment) return res.status(404).send('The appointment with the given ID was not found.');

    const { error } = validateAppointment.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    
    appointment.set(req.body);

    await savePatient(patient);

    res.send(appointment);
});

router.delete('/:id/:appointmentId', validateObjectId, async (req: Request, res: Response) => {
    const patient: PatientDocument | null = await findPatientById(req.params.id);
    if (!patient) return res.status(404).send('The patient with the given ID was not found.');

    const appointment: AppointmentDocument | undefined = patient.appointment.find(app => app._id.toString() === req.params.appointmentId);
    if (!appointment) return res.status(404).send('The appointment with the given ID was not found.');

    const index = patient.appointment.findIndex(app => app._id.toString() === req.params.appointmentId);
    if (index !== -1) {
        patient.appointment.splice(index, 1); 
    }

    await savePatient(patient);

    res.send(appointment);
});

router.get('/hospital/:date', async (req: Request, res: Response) => {
    const date = new Date(req.params.date);

    if (isNaN(date.getTime())) {
        return res.status(400).send('Invalid date.');
    }

    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    const patients: PatientDocument[] = await findAllPatients();

    const appointments: AppointmentDocument[] = patients.reduce((allAppointments: AppointmentDocument[], patient) => {
        const patientAppointments = patient.appointment.filter(appointment => {
            const startTime = new Date(appointment.startTime);
            return startTime >= startOfDay && startTime <= endOfDay;
        });
        return allAppointments.concat(patientAppointments);
    }, []);

    res.send(appointments);
});

router.get('/feeStatus/unpaid', async (req: Request, res: Response) => {
    const patients: PatientDocument[] = await findAllPatients();

    const unpaidAppointments: AppointmentDocument[] = patients.reduce((allAppointments: AppointmentDocument[], patient) => {
        const patientUnpaidAppointments = patient.appointment.filter(appointment => appointment.feeStatus === 'unpaid');
        return allAppointments.concat(patientUnpaidAppointments);
    }, []);

    res.send(unpaidAppointments);
});

router.get('/:id/bill', async (req: Request, res: Response) => {
    const patient: PatientDocument | null = await findPatientById(req.params.id);
    if (!patient) { return res.status(404).send('Patient not found.'); }

    const remainingBill = patient.appointment.reduce((total, appointment) => {
        if (appointment.feeStatus === 'unpaid') {
            return total + parseFloat(appointment.amount);
        }
        return total;
    }, 0);

    res.send({ remainingBill });
});

router.get('/FS/hospital-financial-summary', async (req: Request, res: Response) => {
    try {
        const currentDate = new Date();

        const startOfWeek = new Date(currentDate);
        startOfWeek.setHours(0, 0, 0, 0 - startOfWeek.getDay() * 24 * 60 * 60 * 1000);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 7);

        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

        const patients: PatientDocument[] = await findAllPatients();

        const weeklySummary = aggregateFinancialSummary(patients, startOfWeek, endOfWeek);
        const monthlySummary = aggregateFinancialSummary(patients, startOfMonth, endOfMonth);

        res.send({ weeklySummary, monthlySummary });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/PS/hospital-pet-summary', async (req: Request, res: Response) => {
    try {
        const patients: PatientDocument[] = await findAllPatients();

        const petSummary = aggregatePetSummary(patients);

        res.send(petSummary);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});

export default router;
