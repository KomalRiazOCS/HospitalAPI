import express, { Request, Response } from 'express';
import validateObjectId from '../middleware/validateObjectId';
import { AppointmentDocument, validateAppointment } from '../models/appointment';
import { Patient, validatePatient } from '../models/patient';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
    const patients = await Patient.find().sort('petName');
    res.send(patients);
});

router.post('/', async (req: Request, res: Response) => {
    const { error } = validatePatient.validate(req.body);
    if (error){
        return res.status(400).send(error.details[0].message);
    } 

    let patient = new Patient({
        petName: req.body.petName,
        petType: req.body.petType,
        ownerName: req.body.ownerName,
        ownerAddress: req.body.ownerAddress,
        ownerPhone: req.body.ownerPhone
    });
    patient = await patient.save();
    res.send(patient);
});

router.put('/:id', validateObjectId, async (req: Request, res: Response) => {
    const { error } = validatePatient.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const patient = await Patient.findByIdAndUpdate(req.params.id,
        {
            petName: req.body.petName,
            petType: req.body.petType,
            ownerName: req.body.ownerName,
            ownerAddress: req.body.ownerAddress,
            ownerPhone: req.body.ownerPhone
        }, {
        new: true
    });

    if (!patient) return res.status(404).send('The patient with the given ID was not found.');
    res.send(patient);
});

router.delete('/:id', validateObjectId, async (req: Request, res: Response) => {
    const patient = await Patient.findByIdAndRemove(req.params.id);

    if (!patient) return res.status(404).send('The patient with the given ID was not found.');
    res.send(patient);
});

router.get('/:id', validateObjectId, async (req: Request, res: Response) => {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).send('The patient with the given ID was not found.');

    res.send(patient);
});

router.post('/:id/appointments', validateObjectId, async (req: Request, res: Response) => {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).send('The patient with the given ID was not found.');

    const { error } = validateAppointment.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const { startTime, endTime, description, feeStatus, amount } = req.body;

    let appointment = new AppointmentDocument({
        startTime,
        endTime,
        description,
        feeStatus,
        amount
    });

    patient.appointment.push(appointment);
    await patient.save();

    res.send(patient);
});

router.get('/:id/appointments', validateObjectId, async (req: Request, res: Response) => {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).send('The patient with the given ID was not found.');

    res.send(patient.appointment);
});

router.put('/:id/appointments/:appointmentId', validateObjectId, async (req: Request, res: Response) => {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).send('The patient with the given ID was not found.');

    const appointment = patient.appointment.find(app => app._id.toString() === req.params.appointmentId);
    if (!appointment) return res.status(404).send('The appointment with the given ID was not found.');

    const { error } = validateAppointment.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    
    appointment.set(req.body);

    await patient.save();

    res.send(appointment);
});

router.delete('/:id/appointments/:appointmentId', validateObjectId, async (req: Request, res: Response) => {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).send('The patient with the given ID was not found.');

    const appointment = patient.appointment.find(app => app._id.toString() === req.params.appointmentId);
    if (!appointment) return res.status(404).send('The appointment with the given ID was not found.');

    appointment.remove();

    await patient.save();

    res.send(appointment);
});

router.get('/appointments/:date', async (req: Request, res: Response) => {
    const date = new Date(req.params.date);

    if (isNaN(date.getTime())) {
        return res.status(400).send('Invalid date.');
    }

    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    const patients = await Patient.find();

    const appointments = patients.reduce((allAppointments: AppointmentDocument[], patient) => {
        const patientAppointments = patient.appointment.filter(appointment => {
            const startTime = new Date(appointment.startTime);
            return startTime >= startOfDay && startTime <= endOfDay;
        });
        return allAppointments.concat(patientAppointments);
    }, []);

    res.send(appointments);
});

router.get('/appointments/feeStatus/unpaid', async (req: Request, res: Response) => {
    const patients = await Patient.find();

    const unpaidAppointments = patients.reduce((allAppointments: AppointmentDocument[], patient) => {
        const patientUnpaidAppointments = patient.appointment.filter(appointment => appointment.feeStatus === 'unpaid');
        return allAppointments.concat(patientUnpaidAppointments);
    }, []);

    res.send(unpaidAppointments);
});

router.get('/:id/appointments/bill', async (req: Request, res: Response) => {
    const patient = await Patient.findById(req.params.id);
    if (!patient) { return res.status(404).send('Patient not found.'); }

    const remainingBill = patient.appointment.reduce((total, appointment) => {
        if (appointment.feeStatus === 'unpaid') {
            return total + parseFloat(appointment.amount);
        }
        return total;
    }, 0);

    res.send({ remainingBill });
});

router.get('/hospital/financial-summary', async (req: Request, res: Response) => {
    try {
        const currentDate = new Date();

        const startOfWeek = new Date(currentDate);
        startOfWeek.setHours(0, 0, 0, 0 - startOfWeek.getDay() * 24 * 60 * 60 * 1000);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 7);

        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

        const patients = await Patient.find();

        const weeklySummary = aggregateFinancialSummary(patients, startOfWeek, endOfWeek);
        const monthlySummary = aggregateFinancialSummary(patients, startOfMonth, endOfMonth);

        res.send({ weeklySummary, monthlySummary });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});

function aggregateFinancialSummary(patients: any[], startDate: Date, endDate: Date) {
    const financialSummary = {
        paid: 0,
        unpaid: 0,
        balance: 0
    };

    patients.forEach(patient => {
      patient.appointment.forEach((appointment: AppointmentDocument) => {
          const startTime = new Date(appointment.startTime);
          if (startTime >= startDate && startTime < endDate) {
              if (appointment.feeStatus === 'EUR' || appointment.feeStatus === 'USD' || appointment.feeStatus === 'Bitcoin') {
                  financialSummary.paid += parseFloat(appointment.amount);
              } else if (appointment.feeStatus === 'unpaid') {
                  financialSummary.unpaid += parseFloat(appointment.amount);
              }
          }
      });
  });

  financialSummary.balance = financialSummary.paid - financialSummary.unpaid;

  return financialSummary;
}

router.get('/hospital/pet-summary', async (req: Request, res: Response) => {
  try {
      const patients = await Patient.find();

      const petSummary = aggregatePetSummary(patients);

      res.send(petSummary);
  } catch (error) {
      console.error('Error:', error);
      res.status(500).send('Internal Server Error');
  }
});

function aggregatePetSummary(patients: any[]) {
  const petSummary: any = {};

  patients.forEach(patient => {
      const petType = patient.petType;
      const appointments = patient.appointment;

      if (!petSummary[petType]) {
          petSummary[petType] = {
              count: 0,
              totalAmount: 0
          };
      }

      appointments.forEach((appointment: AppointmentDocument) => {
          petSummary[petType].count++;
          petSummary[petType].totalAmount += parseFloat(appointment.amount);
      });
  });

  let mostPopularPets: string[] = [];
  let maxCount = 0;

  Object.keys(petSummary).forEach(petType => {
      const count = petSummary[petType].count;
      if (count > maxCount) {
          mostPopularPets = [petType]; // Reset most popular pets array
          maxCount = count;
      } else if (count === maxCount) {
          mostPopularPets.push(petType); // Add to most popular pets array
      }
  });

  return { mostPopularPets, petSummary };
}

export default router;
