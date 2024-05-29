import { Patient, PatientDocument } from '../models/patient';
import { AppointmentDocument } from '../models/appointment';

export const savePatient = async (patient: PatientDocument) => {
    return await patient.save();
};

export const aggregateFinancialSummary = (patients: PatientDocument[], startDate: Date, endDate: Date) => {
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
};

export const aggregatePetSummary = (patients: PatientDocument[]) => {
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
            mostPopularPets = [petType];
            maxCount = count;
        } else if (count === maxCount) {
            mostPopularPets.push(petType);
        }
    });

    return { mostPopularPets, petSummary };
};
