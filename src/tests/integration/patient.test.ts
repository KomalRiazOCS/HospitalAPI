import request from 'supertest';
import mongoose from "mongoose";
import { Patient } from '../../models/patient';
import { AppointmentDocument } from '../../models/appointment';
import { server} from '../../index';

describe('/api/patient', () => {
    afterEach(async () => {
       server.close();
        await Patient.deleteMany({});
    });

    afterAll(async () => {
        await mongoose.disconnect();
    });

    describe('GET /', () => {
        it('should return all the patients', async () => {
            await Patient.collection.insertMany([
                { petName: "Doggie", petType: "dog", ownerName: "Komal", ownerAddress: "99-cc", ownerPhone: "00000000000" },
                { petName: "Catto", petType: "cat", ownerName: "Komal", ownerAddress: "22-cc", ownerPhone: "00000000000" },
            ]);
            const res = await request(server).get('/api/patient');
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(2);
            expect(res.body.some((g: any) => g.petName==='Doggie')).toBeTruthy();
            expect(res.body.some((g: any) => g.petName==='Catto')).toBeTruthy();
        });
    });

    describe('POST /', () => {
        let ownerPhone: string;
    
        const exec = async () => {
            return request(server)
                .post('/api/patient')
                .send({ petName: "Doggie", petType: "dog", ownerName: "Komal", ownerAddress: "99-cc", ownerPhone: ownerPhone });
        };
    
        beforeEach(() => {
            ownerPhone = '00000000000';
        });
    
        it('should return 400 if ownerPhone is less than 11 characters', async () => {
            ownerPhone = '0000000000';
    
            const res = await exec();
            expect(res.status).toBe(400);
        });
    
        it('should save the patient if its valid', async () => {
            await exec();
    
            const patient = await Patient.find({ petName: 'Doggie'});
            expect(patient).not.toBeNull();
        });
    
        it('should return the patient if its valid', async () => {
            const res = await exec();
    
            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('petName', 'Doggie');
        });
    });
    

    describe('DELETE /:id', () => {
        let patient: any;
        let id: any;
    
        const exec = async () => {
            return await request(server)
                .delete('/api/patient/' + id)
                .send();
        };
    
        beforeEach(async () => {
            patient = new Patient({ petName: "Doggie", petType: "dog", ownerName: "Komal", ownerAddress: "99-cc", ownerPhone: '00000000000' });
            await patient.save();
    
            id = patient._id;
        });
    
        it('should return 404 if id is invalid', async () => {
            id = 1;
    
            const res = await exec();
            expect(res.status).toBe(404);
        });
    
        it('should return 404 if no patient with the given id was found', async () => {
            id = mongoose.Types.ObjectId();
    
            const res = await exec();
            expect(res.status).toBe(404);
        });
    
        it('should delete the patient if input is valid', async () => {
            await exec();
    
            const patientInDb = await Patient.findById(id);
            expect(patientInDb).toBeNull();
        });
    
        it('should return the removed patient', async () => {
            const res = await exec();
    
            expect(res.body).toHaveProperty('_id', patient._id.toHexString());
            expect(res.body).toHaveProperty('petName', patient.petName);
        });
    });
    
      
    describe('PUT /:id', () => {
        let newOwnerPhone: string;
        let patient: any;
        let id: any;
    
        const exec = async () => {
            return await request(server)
                .put('/api/patient/' + id)
                .send({ petName: "Doggie", petType: "dog", ownerName: "Komal", ownerAddress: "99-cc", ownerPhone: newOwnerPhone });
        };
    
        beforeEach(async () => {
            patient = new Patient({ petName: "Doggie", petType: "dog", ownerName: "Komal", ownerAddress: "99-cc", ownerPhone: '11111111111' });
            await patient.save();
    
            id = patient._id;
            newOwnerPhone = '00000000000';
        });
    
        it('should return 400 if ownerPhone is less than 11 characters', async () => {
            newOwnerPhone = '1234';
    
            const res = await exec();
            expect(res.status).toBe(400);
        });
    
        it('should return 404 if id is invalid', async () => {
            id = 1;
    
            const res = await exec();
            expect(res.status).toBe(404);
        });
    
        it('should return 404 if patient with the given id was not found', async () => {
            id = mongoose.Types.ObjectId();
    
            const res = await exec();
            expect(res.status).toBe(404);
        });
    
        it('should update the patient if input is valid', async () => {
            await exec();
        
            const updatedPatient = await Patient.findById(patient._id);
            expect(updatedPatient).toBeTruthy();
        
            if (updatedPatient) { expect(updatedPatient.ownerPhone).toBe(newOwnerPhone); }
        });
        
    
        it('should return the updated patient if it is valid', async () => {
            const res = await exec();
    
            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('ownerPhone', newOwnerPhone);
        });
    });
    

    describe('GET /:id', () => {
        it('should return the patient with passed id', async () => {
            const patient = new Patient({ petName: "Doggie", petType: "dog", ownerName: "Komal", ownerAddress: "99-cc", ownerPhone: '11111111111' });
            await patient.save();
    
            const res = await request(server).get(`/api/patient/${patient._id}`);
    
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('petName', patient.petName);
        });
    
        it('should return status 404 in case of invalid id', async () => {
            const res = await request(server).get(`/api/patient/1`);
    
            expect(res.status).toBe(404);
        });
    });
    
    
    describe('POST /:id/appointments', () => {
        let patient: any;
        let patientId: any;
        let appointmentData: any;
    
        const exec = async () => {
            return request(server)
                .post(`/api/patient/${patientId}/appointments`)
                .set('Content-Type', "application/json")
                .send(appointmentData);
        };
    
        beforeEach(async () => {
            patient = new Patient({
                petName: "Dogg",
                petType: "dog",
                ownerName: "Komal",
                ownerAddress: "99-cc",
                ownerPhone: "00000000000"
            });
    
            appointmentData = {
                startTime: new Date(),
                endTime: new Date(Date.now() + 3600000), // 1 hour later
                description: "General checkup",
                feeStatus: "USD",
                amount: "100"
            };
    
            await patient.save();
            patientId = patient._id;
        });
    
        it('should return 404 if patient with the given ID was not found', async () => {
            patientId = mongoose.Types.ObjectId();
            const res = await exec();
            expect(res.status).toBe(404);
            expect(res.text).toBe('The patient with the given ID was not found.');
        });
    
        it('should save the appointment if it is valid', async () => {
            await exec();
    
            const patientInDb = await Patient.findById(patientId);
            if(patientInDb){
                expect(patientInDb.appointment[0]).toHaveProperty('description', 'General checkup');
                expect(patientInDb.appointment[0]).toHaveProperty('feeStatus', 'USD');
            }            
        });
    
        it('should return the patient with the new appointment if it is valid', async () => {
            const res = await exec();
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('_id', patient._id.toHexString());
            expect(res.body.appointment[0]).toHaveProperty('description', 'General checkup');
            expect(res.body.appointment[0]).toHaveProperty('feeStatus', 'USD');
        });
    });
    

    describe('GET /:id/appointments', () => {
        let patient: any;
        let patientId: any;
    
        const exec = async () => {
            return request(server)
                .get(`/api/patient/${patientId}/appointments`)
                .set('Content-Type', "application/json");
        };
    
        beforeEach(async () => {
            patient = new Patient({
                petName: "Dogg",
                petType: "dog",
                ownerName: "Komal",
                ownerAddress: "99-cc",
                ownerPhone: "00000000000",
                appointment: [{
                    startTime: new Date(),
                    endTime: new Date(Date.now() + 3600000), // 1 hour later
                    description: "General checkup",
                    feeStatus: "USD",
                    amount: "100"
                }]
            });
    
            await patient.save();
            patientId = patient._id;
        });
    
        it('should return 404 if patient with the given ID was not found', async () => {
            patientId = mongoose.Types.ObjectId();
            const res = await exec();
            expect(res.status).toBe(404);
            expect(res.text).toBe('The patient with the given ID was not found.');
        });
    
        it('should return 200 and the patient\'s appointments if the ID is valid', async () => {
            const res = await exec();
            expect(res.status).toBe(200);
            expect(res.body).toBeDefined();
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body[0]).toHaveProperty('description', 'General checkup');
            expect(res.body[0]).toHaveProperty('feeStatus', 'USD');
        });
    });
    

    describe('PUT /:id/appointments/:appointmentId', () => {
        let patient: any;
        let patientId: any;
        let appointmentId: any;
        let newAppointmentData: any;
    
        const exec = async () => {
            return request(server)
                .put(`/api/patient/${patientId}/appointments/${appointmentId}`)
                .set('Content-Type', "application/json")
                .send(newAppointmentData);
        };
    
        beforeEach(async () => {
            patient = new Patient({
                petName: "Dogg",
                petType: "dog",
                ownerName: "Komal",
                ownerAddress: "99-cc",
                ownerPhone: "00000000000",
                appointment: [{
                    startTime: new Date(),
                    endTime: new Date(Date.now() + 3600000), // 1 hour later
                    description: "General checkup",
                    feeStatus: "USD",
                    amount: "100"
                }]
            });
    
            await patient.save();
            patientId = patient._id;
            appointmentId = patient.appointment[0]._id;
            
            newAppointmentData = {
                startTime: new Date(),
                endTime: new Date(Date.now() + 7200000), // 2 hours later
                description: "Updated checkup",
                feeStatus: "EUR",
                amount: "150"
            };
        });
    
        it('should return 404 if patient with the given ID was not found', async () => {
            patientId = mongoose.Types.ObjectId();
            const res = await exec();
            expect(res.status).toBe(404);
            expect(res.text).toBe('The patient with the given ID was not found.');
        });
    
        it('should return 404 if appointment with the given ID was not found', async () => {
            appointmentId = mongoose.Types.ObjectId();
            const res = await exec();
            expect(res.status).toBe(404);
            expect(res.text).toBe('The appointment with the given ID was not found.');
        });
    
        it('should update the appointment if it is valid', async () => {
            const res = await exec();
            
            expect(res.status).toBe(200);
            
            const patientInDb = await Patient.findById(patientId);
            if(patientInDb) {
                const updatedAppointment = patientInDb.appointment.find((appt: AppointmentDocument) => appt._id.toString() === appointmentId.toString());
                expect(updatedAppointment).toHaveProperty('description', 'Updated checkup');
                expect(updatedAppointment).toHaveProperty('feeStatus', 'EUR');
                expect(updatedAppointment).toHaveProperty('amount', '150');
            };           
        });
    
        it('should return the updated appointment if it is valid', async () => {
            const res = await exec();
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('description', 'Updated checkup');
            expect(res.body).toHaveProperty('feeStatus', 'EUR');
            expect(res.body).toHaveProperty('amount', '150');
        });
    });
    

    describe('DELETE /:id/appointments/:appointmentId', () => {
        let patient: any;
        let patientId: any;
        let appointmentId: any;
    
        const exec = async () => {
            return request(server)
                .delete(`/api/patient/${patientId}/appointments/${appointmentId}`)
                .set('Content-Type', "application/json");
        };
    
        beforeEach(async () => {
            patient = new Patient({
                petName: "Dogg",
                petType: "dog",
                ownerName: "Komal",
                ownerAddress: "99-cc",
                ownerPhone: "00000000000",
                appointment: [{
                    startTime: new Date(),
                    endTime: new Date(Date.now() + 3600000), // 1 hour later
                    description: "General checkup",
                    feeStatus: "USD",
                    amount: "100"
                }]
            });
    
            await patient.save();
            patientId = patient._id;
            appointmentId = patient.appointment[0]._id;
        });
    
        it('should return 404 if patient with the given ID was not found', async () => {
            patientId = mongoose.Types.ObjectId();
            const res = await exec();
            expect(res.status).toBe(404);
            expect(res.text).toBe('The patient with the given ID was not found.');
        });
    
        it('should return 404 if appointment with the given ID was not found', async () => {
            appointmentId = mongoose.Types.ObjectId();
            const res = await exec();
            expect(res.status).toBe(404);
            expect(res.text).toBe('The appointment with the given ID was not found.');
        });
    
        it('should delete the appointment if it is valid', async () => {
            const res = await exec();
            
            expect(res.status).toBe(200);
    
            const patientInDb = await Patient.findById(patientId);
            if(patientInDb) {
                const deletedAppointment = patientInDb.appointment.find((appt: AppointmentDocument) => appt._id.toString() === appointmentId.toString());
                expect(deletedAppointment).toBeUndefined();
            }            
        });
    
        it('should return the deleted appointment if it is valid', async () => {
            const res = await exec();
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('_id', appointmentId.toHexString());
            expect(res.body).toHaveProperty('description', 'General checkup');
        });
    });
    

    describe('GET /appointments/:date', () => {
        let patient1: any, patient2: any;
        let appointmentData1: any, appointmentData2: any, appointmentData3: any;
    
        const exec = async (date: string) => {
            return request(server)
                .get(`/api/patient/appointments/${date}`)
                .set('Content-Type', "application/json");
        };
    
        beforeEach(async () => {
            
            appointmentData1 = {
                startTime: new Date('2023-05-22T10:00:00Z'),
                endTime: new Date('2023-05-22T11:00:00Z'),
                description: "General checkup 1",
                feeStatus: "USD",
                amount: "100"
            };
            
            appointmentData2 = {
                startTime: new Date('2023-05-22T14:00:00Z'),
                endTime: new Date('2023-05-22T15:00:00Z'),
                description: "General checkup 2",
                feeStatus: "USD",
                amount: "200"
            };
    
            appointmentData3 = {
                startTime: new Date('2023-05-23T10:00:00Z'),
                endTime: new Date('2023-05-23T11:00:00Z'),
                description: "General checkup 3",
                feeStatus: "USD",
                amount: "150"
            };
    
            patient1 = new Patient({
                petName: "Dog1",
                petType: "dog",
                ownerName: "Owner1",
                ownerAddress: "Address1",
                ownerPhone: "11111111111",
                appointment: [appointmentData1]
            });
    
            patient2 = new Patient({
                petName: "Dog2",
                petType: "dog",
                ownerName: "Owner2",
                ownerAddress: "Address2",
                ownerPhone: "22222222222",
                appointment: [appointmentData2, appointmentData3]
            });
    
            await patient1.save();
            await patient2.save();
        });
    
        it('should return 400 if the date is invalid', async () => {
            const res = await exec('invalid-date');
            expect(res.status).toBe(400);
            expect(res.text).toBe('Invalid date.');
        });
    
        it('should return appointments for the specified date', async () => {
            const res = await exec('2023-05-22');
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(2);
    
            expect(res.body.some((a: any) => a.description === 'General checkup 1')).toBeTruthy();
            expect(res.body.some((a: any) => a.description === 'General checkup 2')).toBeTruthy();
        });
    
        it('should return an empty array if no appointments are found for the specified date', async () => {
            const res = await exec('2023-05-24');
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(0);
        });
    });
    

    describe('GET /appointments/feeStatus/unpaid', () => {
        let patient1: any, patient2: any;
        let appointmentData1: any, appointmentData2: any, appointmentData3: any, appointmentData4: any;
    
        const exec = async () => {
            return request(server)
                .get('/api/patient/appointments/feeStatus/unpaid')
                .set('Content-Type', "application/json");
        };
    
        beforeEach(async () => {
            appointmentData1 = {
                startTime: new Date('2023-05-22T10:00:00Z'),
                endTime: new Date('2023-05-22T11:00:00Z'),
                description: "General checkup",
                feeStatus: "unpaid",
                amount: "100"
            };
            
            appointmentData2 = {
                startTime: new Date('2023-05-22T14:00:00Z'),
                endTime: new Date('2023-05-22T15:00:00Z'),
                description: "Vaccination",
                feeStatus: "USD",
                amount: "200"
            };
    
            appointmentData3 = {
                startTime: new Date('2023-05-23T10:00:00Z'),
                endTime: new Date('2023-05-23T11:00:00Z'),
                description: "Checkup",
                feeStatus: "unpaid",
                amount: "150"
            };
    
            appointmentData4 = {
                startTime: new Date('2023-05-23T12:00:00Z'),
                endTime: new Date('2023-05-23T13:00:00Z'),
                description: "Surgery",
                feeStatus: "EUR",
                amount: "500"
            };
    
            patient1 = new Patient({
                petName: "Dog1",
                petType: "dog",
                ownerName: "Owner1",
                ownerAddress: "Address1",
                ownerPhone: "11111111111",
                appointment: [appointmentData1, appointmentData2]
            });
    
            patient2 = new Patient({
                petName: "Dog2",
                petType: "dog",
                ownerName: "Owner2",
                ownerAddress: "Address2",
                ownerPhone: "22222222222",
                appointment: [appointmentData3, appointmentData4]
            });
    
            await patient1.save();
            await patient2.save();
        });
    
        it('should return all unpaid appointments', async () => {
            const res = await exec();
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(2);
    
            expect(res.body.some((a: any) => a.description === 'General checkup')).toBeTruthy();
            expect(res.body.some((a: any) => a.description === 'Checkup')).toBeTruthy();
        });
    
        it('should return an empty array if there are no unpaid appointments', async () => {
            await Patient.deleteMany({});
            
            patient1 = new Patient({
                petName: "Dog1",
                petType: "dog",
                ownerName: "Owner1",
                ownerAddress: "Address1",
                ownerPhone: "11111111111",
                appointment: [appointmentData2] // only paid appointments
            });
    
            patient2 = new Patient({
                petName: "Dog2",
                petType: "dog",
                ownerName: "Owner2",
                ownerAddress: "Address2",
                ownerPhone: "22222222222",
                appointment: [appointmentData4] // only paid appointments
            });
    
            await patient1.save();
            await patient2.save();
    
            const res = await exec();
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(0);
        });
    });
    

    describe('GET /:id/appointments/bill', () => {
        let patient: any;
        let patientId: any;
        let appointmentData1: any, appointmentData2: any, appointmentData3: any;
    
        const exec = async () => {
            return request(server)
                .get(`/api/patient/${patientId}/appointments/bill`)
                .set('Content-Type', "application/json");
        };
    
        beforeEach(async () => {
                appointmentData1 = {
                startTime: new Date('2023-05-22T10:00:00Z'),
                endTime: new Date('2023-05-22T11:00:00Z'),
                description: "General checkup",
                feeStatus: "unpaid",
                amount: "100"
            };
            
            appointmentData2 = {
                startTime: new Date('2023-05-22T14:00:00Z'),
                endTime: new Date('2023-05-22T15:00:00Z'),
                description: "Vaccination",
                feeStatus: "USD",
                amount: "200"
            };
    
            appointmentData3 = {
                startTime: new Date('2023-05-23T10:00:00Z'),
                endTime: new Date('2023-05-23T11:00:00Z'),
                description: "Checkup",
                feeStatus: "unpaid",
                amount: "150"
            };
    
            patient = new Patient({
                petName: "Dog1",
                petType: "dog",
                ownerName: "Owner1",
                ownerAddress: "Address1",
                ownerPhone: "11111111111",
                appointment: [appointmentData1, appointmentData2, appointmentData3]
            });
    
            await patient.save();
            patientId = patient._id;
        });
    
        it('should return 404 if patient with the given ID was not found', async () => {
            patientId = mongoose.Types.ObjectId();
            const res = await exec();
            expect(res.status).toBe(404);
            expect(res.text).toBe('Patient not found.');
        });
    
        it('should return the total remaining bill for unpaid appointments', async () => {
            const res = await exec();
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('remainingBill', 250);
        });
    
        it('should return 0 if there are no unpaid appointments', async () => {
            await Patient.deleteMany({});
    
            patient = new Patient({
                petName: "Dog2",
                petType: "dog",
                ownerName: "Owner2",
                ownerAddress: "Address2",
                ownerPhone: "22222222222",
                appointment: [appointmentData2] // only paid appointments
            });
    
            await patient.save();
            patientId = patient._id;
    
            const res = await exec();
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('remainingBill', 0);
        });
    });
    

    describe('GET /hospital/financial-summary', () => {
        let patient1: any, patient2: any;
        let appointmentData1: any, appointmentData2: any, appointmentData3: any;
    
        const exec = async () => {
            return request(server)
                .get('/api/patient/hospital/financial-summary')
                .set('Content-Type', "application/json");
        };
    
        beforeEach(async () => {
            appointmentData1 = {
                startTime: new Date('2024-05-12T10:00:00Z'),
                endTime: new Date('2024-05-12T11:00:00Z'),
                description: "General checkup",
                feeStatus: "EUR",
                amount: "100"
            };
            
            appointmentData2 = {
                startTime: new Date('2024-05-23T14:00:00Z'),
                endTime: new Date('2024-05-23T15:00:00Z'),
                description: "Vaccination",
                feeStatus: "USD",
                amount: "200"
            };
    
            appointmentData3 = {
                startTime: new Date('2024-05-21T14:00:00Z'),
                endTime: new Date('2024-05-21T15:00:00Z'), 
                description: "Checkup",
                feeStatus: "unpaid",
                amount: "150"
            };
            
            patient1 = new Patient({
                petName: "Dog1",
                petType: "dog",
                ownerName: "Owner1",
                ownerAddress: "Address1",
                ownerPhone: "111111111111",
                appointment: [appointmentData2, appointmentData3]
            });
    
            patient2 = new Patient({
                petName: "Dog2",
                petType: "dog",
                ownerName: "Owner2",
                ownerAddress: "Address2",
                ownerPhone: "22222222222",
                appointment: [appointmentData2, appointmentData3, appointmentData1]
            });
    
            await patient1.save();
            await patient2.save();
        });
    
        it('should return weekly and monthly financial summaries', async () => {
            const res = await exec();
            expect(res.status).toBe(200);
    
            expect(res.body).toHaveProperty('weeklySummary');
            expect(res.body).toHaveProperty('monthlySummary');
    
            expect(res.body.weeklySummary).toHaveProperty('paid');
            expect(res.body.weeklySummary).toHaveProperty('unpaid');
            expect(res.body.weeklySummary).toHaveProperty('balance');
            expect(res.body.monthlySummary).toHaveProperty('paid');
            expect(res.body.monthlySummary).toHaveProperty('unpaid');
            expect(res.body.monthlySummary).toHaveProperty('balance');
    
            expect(res.body.weeklySummary.paid).toBe(400); 
            expect(res.body.weeklySummary.unpaid).toBe(300);
            expect(res.body.weeklySummary.balance).toBe(100);
    
            expect(res.body.monthlySummary.paid).toBe(500); 
            expect(res.body.monthlySummary.unpaid).toBe(300);
            expect(res.body.monthlySummary.balance).toBe(200);
        });
    });
    

    describe('GET /hospital/pet-summary', () => {
        let patient1: any, patient2: any, patient3: any;
    
        const exec = async () => {
            return request(server)
                .get('/api/patient/hospital/pet-summary')
                .set('Content-Type', 'application/json');
        };
    
        beforeEach(async () => {
            patient1 = new Patient({
                petName: 'Dog1',
                petType: 'dog',
                ownerName: 'Owner1',
                ownerAddress: 'Address1',
                ownerPhone: '111111111111',
                appointment: [
                    {
                        startTime: new Date('2024-05-12T10:00:00Z'),
                        endTime: new Date('2024-05-12T11:00:00Z'),
                        description: 'General checkup',
                        feeStatus: 'EUR',
                        amount: '100'
                    },
                    {
                        startTime: new Date('2024-05-23T14:00:00Z'),
                        endTime: new Date('2024-05-23T15:00:00Z'),
                        description: 'Vaccination',
                        feeStatus: 'USD',
                        amount: '200'
                    }
                ]
            });
    
            patient2 = new Patient({
                petName: 'Cat1',
                petType: 'cat',
                ownerName: 'Owner2',
                ownerAddress: 'Address2',
                ownerPhone: '22222222222',
                appointment: [
                    {
                        startTime: new Date('2024-05-21T14:00:00Z'),
                        endTime: new Date('2024-05-21T15:00:00Z'),
                        description: 'Checkup',
                        feeStatus: 'unpaid',
                        amount: '150'
                    }
                ]
            });
    
            patient3 = new Patient({
                petName: 'Dog2',
                petType: 'dog',
                ownerName: 'Owner3',
                ownerAddress: 'Address3',
                ownerPhone: '33333333333',
                appointment: [
                    {
                        startTime: new Date('2024-05-21T14:00:00Z'),
                        endTime: new Date('2024-05-21T15:00:00Z'),
                        description: 'Checkup',
                        feeStatus: 'USD',
                        amount: '150'
                    }
                ]
            });
    
            await patient1.save();
            await patient2.save();
            await patient3.save();
        });
    
        it('should return pet summary', async () => {
            const res = await exec();
    
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('mostPopularPets');
            expect(res.body).toHaveProperty('petSummary');
    
            const { mostPopularPets, petSummary } = res.body;
    
            expect(mostPopularPets).toEqual(['dog']); 
            expect(petSummary).toHaveProperty('dog');
            expect(petSummary).toHaveProperty('cat');
    
            const dogSummary = petSummary['dog'];
            const catSummary = petSummary['cat'];
    
            expect(dogSummary.count).toBe(3);
            expect(dogSummary.totalAmount).toBe(450);
            expect(catSummary.count).toBe(1); 
            expect(catSummary.totalAmount).toBe(150); 
        });
    });    
    
});
     


