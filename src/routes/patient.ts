import express, { Request, Response } from 'express';
import validateObjectId from '../helper/validateObjectId';
import { PatientDocument, Patient } from '../models/patient';
import { validatePatient } from '../models/patient';
import { 
    findAllPatients, 
    findPatientById, 
    createPatient, 
    updatePatientById, 
    deletePatientById 
} from '../repository/patient';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
    const patients: PatientDocument[] = await findAllPatients();
    res.send(patients);
});

router.post('/', async (req: Request, res: Response) => {
    const { error } = validatePatient.validate(req.body);
    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    const patientData = {
        petName: req.body.petName,
        petType: req.body.petType,
        ownerName: req.body.ownerName,
        ownerAddress: req.body.ownerAddress,
        ownerPhone: req.body.ownerPhone
    };

    const patient: PatientDocument = await createPatient(patientData);
    res.send(patient);
});

router.put('/:id', validateObjectId, async (req: Request, res: Response) => {
    const { error } = validatePatient.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const patientData = {
        petName: req.body.petName,
        petType: req.body.petType,
        ownerName: req.body.ownerName,
        ownerAddress: req.body.ownerAddress,
        ownerPhone: req.body.ownerPhone
    };

    const patient: PatientDocument | null = await updatePatientById(req.params.id, patientData);

    if (!patient) return res.status(404).send('The patient with the given ID was not found.');
    res.send(patient);
});

router.delete('/:id', validateObjectId, async (req: Request, res: Response) => {
    const patient: PatientDocument | null = await deletePatientById(req.params.id);

    if (!patient) return res.status(404).send('The patient with the given ID was not found.');
    res.send(patient);
});

router.get('/:id', validateObjectId, async (req: Request, res: Response) => {
    const patient: PatientDocument | null = await findPatientById(req.params.id);
    if (!patient) return res.status(404).send('The patient with the given ID was not found.');

    res.send(patient);
});

export default router;
