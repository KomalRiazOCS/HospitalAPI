const request = require('supertest');
const mongoose = require("mongoose")
const {Genre} = require('../../models/genre');
const {User} = require('../../models/users');
let server;

describe('auth middleware', () => {
    beforeEach(() => {
        server = require('../../index');
        const user = new User();
        token = user.GenerateAuthToken();
    });
    afterEach(async () => {
        server.close();
        await Genre.deleteMany({});                
    });

    afterAll(async () => {
        await mongoose.disconnect();
    });

    let token;

    const exec = async () => {
        return request(server)
        .post('/api/genres')
        .set('x-auth-token', token)
        .send({ name: 'genre1' });
    }

    it('should return 401 if no token is provided', async () => {
        token = '';

        const res = await exec();
        expect(res.status).toBe(401);
    }); 

    it('should return 400 in case of invalid token', async () => {
        token = null;

        const res = await exec();
        expect(res.status).toBe(400);
    }); 

    it('should return 200 in case of valid token', async () => {
        const res = await exec();
        expect(res.status).toBe(200);
    }); 
});

