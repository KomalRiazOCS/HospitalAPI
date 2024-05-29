import request from 'supertest';
import mongoose from "mongoose";
import { Patient } from '../../models/patient';
import { AppointmentDocument } from '../../models/appointment';
import { testServer } from '../../index';

describe('/api/appointment', () => {
    afterEach(async () => {
        testServer.close();
        await Patient.deleteMany({});
    });

    afterAll(async () => {
        await mongoose.disconnect();
    });

    describe('POST /:id', () => {
        let patient: any;
        let patientId: any;
        let appointmentData: any;
    
        const exec = async () => {
            return request(testServer)
                .post(`/api/appointment/${patientId}`)
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
    

    describe('GET /:id', () => {
        let patient: any;
        let patientId: any;
    
        const exec = async () => {
            return request(testServer)
                .get(`/api/appointment/${patientId}`)
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
    

    describe('PUT /:id/:appointmentId', () => {
        let patient: any;
        let patientId: any;
        let appointmentId: any;
        let newAppointmentData: any;
    
        const exec = async () => {
            return request(testServer)
                .put(`/api/appointment/${patientId}/${appointmentId}`)
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
    

    describe('DELETE /:id/:appointmentId', () => {
        let patient: any;
        let patientId: any;
        let appointmentId: any;
    
        const exec = async () => {
            return request(testServer)
                .delete(`/api/appointment/${patientId}/${appointmentId}`)
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
    

    describe('GET /:date', () => {
        let patient1: any, patient2: any;
        let appointmentData1: any, appointmentData2: any, appointmentData3: any;
    
        const exec = async (date: string) => {
            return request(testServer)
                .get(`/api/appointment/hospital/${date}`)
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
    

    describe('GET /feeStatus/unpaid', () => {
        let patient1: any, patient2: any;
        let appointmentData1: any, appointmentData2: any, appointmentData3: any, appointmentData4: any;
    
        const exec = async () => {
            return request(testServer)
                .get('/api/appointment/feeStatus/unpaid')
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
    

    describe('GET /:id/bill', () => {
        let patient: any;
        let patientId: any;
        let appointmentData1: any, appointmentData2: any, appointmentData3: any;
    
        const exec = async () => {
            return request(testServer)
                .get(`/api/appointment/${patientId}/bill`)
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
    

    describe('GET /hospital-financial-summary', () => {
        let patient1: any, patient2: any;
        let appointmentData1: any, appointmentData2: any, appointmentData3: any;
    
        const exec = async () => {
            return request(testServer)
                .get('/api/appointment/FS/hospital-financial-summary')
                .set('Content-Type', "application/json");
        };
    
        beforeEach(async () => {
            const today = new Date();
            appointmentData1 = {
                startTime: new Date(today.setDate(today.getDate() - 2)),
                endTime: new Date(today.setDate(today.getDate() - 2)), 
                description: "General checkup",
                feeStatus: "EUR",
                amount: "100"
            };
    
            appointmentData2 = {
                startTime: new Date(today.setDate(today.getDate())), 
                endTime: new Date(today.setDate(today.getDate())), 
                description: "Vaccination",
                feeStatus: "USD",
                amount: "200"
            };
    
            appointmentData3 = {
                startTime: new Date(today.setDate(today.getDate() - 1)), 
                endTime: new Date(today.setDate(today.getDate() - 1)), 
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
    
            expect(res.body.weeklySummary.paid).toBe(100); 
            expect(res.body.weeklySummary.unpaid).toBe(0);
            expect(res.body.weeklySummary.balance).toBe(100);
    
            expect(res.body.monthlySummary.paid).toBe(500); 
            expect(res.body.monthlySummary.unpaid).toBe(300);
            expect(res.body.monthlySummary.balance).toBe(200);
        });
    });
    

    describe('GET /hospital-pet-summary', () => {
        let patient1: any, patient2: any, patient3: any;
    
        const exec = async () => {
            return request(testServer)
                .get('/api/appointment/PS/hospital-pet-summary')
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
     


