import request from 'supertest';
import express from 'express';
import { mockReset } from 'jest-mock-extended';
import bcrypt from 'bcrypt';
import validateAuth from '../validation/authValidation';
import { findUserByEmail } from '../repository/users';

import router from '../routes/auth';

jest.mock('../repository/users');
jest.mock('../validation/authValidation');
jest.mock('bcrypt');

const mockFindUserByEmail = findUserByEmail;
const mockValidateAuth = validateAuth;
const mockBcryptCompare = bcrypt.compare;

const app = express();
app.use(express.json());
app.use('/api/auth', router);

describe('Authentication API', () => {
  const testUser = {
    _id: '1',
    firstname: 'John',
    lastname: 'Doe',
    email: 'john.doe@example.com',
    password: 'hashedPassword',
    generateAuthToken: () => 'token'
  };

  beforeEach(() => {
    mockReset(mockFindUserByEmail);
    mockReset(mockValidateAuth);
    mockReset(mockBcryptCompare);
  });

  it('should return a token if valid credentials are provided', async () => {
    (mockValidateAuth as jest.Mock).mockReturnValue({ error: null });
    (mockFindUserByEmail as jest.Mock).mockResolvedValue(testUser);
    (mockBcryptCompare as jest.Mock).mockResolvedValue(true);

    const response = await request(app)
      .post('/api/auth')
      .send({
        email: 'john.doe@example.com',
        password: 'password123'
      });

    expect(response.status).toBe(200);
    expect(response.text).toBe('token');
  });

  it('should return 400 if validation fails', async () => {
    (mockValidateAuth as jest.Mock).mockReturnValue({ error: { details: [{ message: 'Validation error' }] } });

    const response = await request(app)
      .post('/api/auth')
      .send({
        email: 'john.doe@example.com',
        password: 'password123'
      });

    expect(response.status).toBe(400);
    expect(response.text).toBe('Validation error');
  });

  it('should return 400 if the user does not exist', async () => {
    (mockValidateAuth as jest.Mock).mockReturnValue({ error: null });
    (mockFindUserByEmail as jest.Mock).mockResolvedValue(null);

    const response = await request(app)
      .post('/api/auth')
      .send({
        email: 'john.doe@example.com',
        password: 'password123'
      });

    expect(response.status).toBe(400);
    expect(response.text).toBe('Invalid email or password.');
  });

  it('should return 400 if the password is invalid', async () => {
   (mockValidateAuth as jest.Mock).mockReturnValue({ error: null });
   (mockFindUserByEmail as jest.Mock).mockResolvedValue(testUser);
   (mockBcryptCompare as jest.Mock).mockResolvedValue(false);

    const response = await request(app)
      .post('/api/auth')
      .send({
        email: 'john.doe@example.com',
        password: 'password123'
      });

    expect(response.status).toBe(400);
    expect(response.text).toBe('Invalid email or password.');
  });
});
