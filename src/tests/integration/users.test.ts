import request from 'supertest';
import mongoose from 'mongoose';
import { User } from '../../models/users';
import { stopGameCodeCleanupJob } from '../../startup/expiredGameCode';
import { startServer, testServer }  from '../../index';

describe('/api/users', () => {
    beforeAll(async () => {
        await startServer();
    }); 

    afterEach(async () => {
        if (testServer) {
            await testServer.close();
        }
        await User.deleteMany({});
    });

    afterAll(async () => {
        await mongoose.disconnect();
        stopGameCodeCleanupJob();
    });

    describe('POST /register', () => {
        it('should return 400 if email is not provided', async () => {
            const res = await request(testServer)
                .post('/api/register')
                .send({});
            expect(res.status).toBe(400);
        });

        it('should return 400 if email is invalid', async () => {
            const res = await request(testServer)
                .post('/api/register')
                .send({ email: 'invalid_email' });
            expect(res.status).toBe(400);
        });

        it('should return 400 if email is already registered', async () => {
            const user = new User({ email: 'test@example.com' });
            await user.save();

            const res = await request(testServer)
                .post('/api/register')
                .send({ email: 'test@example.com' });

            expect(res.status).toBe(400);
        });

        it('should return the registered user if input is valid', async () => {
            const res = await request(testServer)
                .post('/api/register')
                .send({ email: 'test@example.com' });

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('email', 'test@example.com');
        });
    });

    describe('POST /generate-game-codes', () => {
        it('should return 400 if email is not provided', async () => {
            const res = await request(testServer)
                .post('/api/generate-game-codes')
                .send({});
            expect(res.status).toBe(400);
        });

        it('should return 400 if email is invalid', async () => {
            const res = await request(testServer)
                .post('/api/generate-game-codes')
                .send({ email: 'invalid_email' });
            expect(res.status).toBe(400);
        });

        it('should return 400 if user not found', async () => {
            const res = await request(testServer)
                .post('/api/generate-game-codes')
                .send({ email: 'nonexistent@example.com' });
            expect(res.status).toBe(400);
        });

        it('should return the updated user with generated game codes if input is valid', async () => {
            const user = new User({ email: 'test@example.com' });
            await user.save();

            const res = await request(testServer)
                .post('/api/generate-game-codes')
                .send({ email: 'test@example.com', noOfGameCodes: 3 });

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('email', 'test@example.com');
            expect(res.body).toHaveProperty('gameCodes');
            expect(res.body.gameCodes.length).toBe(3);
        });
    });

    describe('POST /login', () => {
        it('should return 400 if email is not provided', async () => {
            const res = await request(testServer)
                .post('/api/login')
                .send({});
            expect(res.status).toBe(400);
        });

        it('should return 400 if email is invalid', async () => {
            const res = await request(testServer)
                .post('/api/login')
                .send({ email: 'invalid_email' });
            expect(res.status).toBe(400);
        });

        it('should return 400 if game code is not provided', async () => {
            const res = await request(testServer)
                .post('/api/login')
                .send({ email: 'test@example.com' });
            expect(res.status).toBe(400);
        });

        it('should return 400 if user not found', async () => {
            const res = await request(testServer)
                .post('/api/login')
                .send({ email: 'nonexistent@example.com', gameCode: '12345678' });
            expect(res.status).toBe(400);
        });

        it('should return 403 if login attempt exceeds 5 times', async () => {
            const user = new User({ email: 'test@example.com' });
            user.loginAttempt = 5;
            await user.save();

            const res = await request(testServer)
                .post('/api/login')
                .send({ email: 'test@example.com', gameCode: '12345678' });
            expect(res.status).toBe(403);
        });

        it('should return the authentication token if input is valid', async () => {
            const user = new User({ email: 'test@example.com', gameCodes: [{ code: '12345678' }] });
            await user.save();

            const res = await request(testServer)
                .post('/api/login')
                .send({ email: 'test@example.com', gameCode: '12345678' });
            expect(res.status).toBe(200);
        });
    });

    describe('GET /health-check', () => {
        it('should return status 200 and "Service is up and running"', async () => {
            const res = await request(testServer).get('/api/health-check');
            expect(res.status).toBe(200);
            expect(res.text).toBe('Service is up and running');
        });
    });
});
