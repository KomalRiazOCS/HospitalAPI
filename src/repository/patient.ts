import { PatientDocument, Patient } from '../models/patient';

export const findAllPatients = async (): Promise<PatientDocument[]> => {
    return await Patient.find();
};

export const findPatientById = async (id: string): Promise<PatientDocument | null> => {
    return await Patient.findById(id);
};

export const createPatient = async (patientData: Partial<PatientDocument>): Promise<PatientDocument> => {
    const patient = new Patient(patientData);
    return await patient.save();
};

export const updatePatientById = async (id: string, patientData: Partial<PatientDocument>): Promise<PatientDocument | null> => {
    return await Patient.findByIdAndUpdate(id, patientData, { new: true });
};

export const deletePatientById = async (id: string): Promise<PatientDocument | null> => {
    return await Patient.findByIdAndDelete(id);
};
