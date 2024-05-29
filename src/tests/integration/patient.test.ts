import request from 'supertest';
import mongoose from "mongoose";
import { Patient } from '../../models/patient';
import { AppointmentDocument } from '../../models/appointment';
import { testServer} from '../../index';

describe('/api/patient', () => {
    afterEach(async () => {
       testServer.close();
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
            const res = await request(testServer).get('/api/patient');
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(2);
            expect(res.body.some((g: any) => g.petName==='Doggie')).toBeTruthy();
            expect(res.body.some((g: any) => g.petName==='Catto')).toBeTruthy();
        });
    });

    describe('POST /', () => {
        let ownerPhone: string;
    
        const exec = async () => {
            return request(testServer)
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
            return await request(testServer)
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
            return await request(testServer)
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
    
            const res = await request(testServer).get(`/api/patient/${patient._id}`);
    
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('petName', patient.petName);
        });
    
        it('should return status 404 in case of invalid id', async () => {
            const res = await request(testServer).get(`/api/patient/1`);
    
            expect(res.status).toBe(404);
        });
    });
    
});
     


