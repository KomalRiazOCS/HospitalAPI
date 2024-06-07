import request from 'supertest';
import express from 'express';
import bcrypt from 'bcrypt';
import { v2 as cloudinary } from 'cloudinary';
import { findUserByEmail, createUser } from '../repository/users';
import { User, IUser } from '../models/user';
import userValidation from '../validation/userValidation';

import router from '../routes/users';

jest.mock('../repository/users');
jest.mock('../validation/userValidation');
jest.mock('bcrypt');
jest.mock('cloudinary', () => {
  const originalModule = jest.requireActual('cloudinary');
  return {
    v2: {
      ...originalModule.v2,
      uploader: {
        upload_stream: jest.fn()
      }
    }
  };
});

const mockFindUserByEmail = jest.mocked(findUserByEmail);
const mockUserValidation = jest.mocked(userValidation);
const mockCreateUser = jest.mocked(createUser);
const mockBcryptGenSalt = jest.mocked(bcrypt.genSalt);
const mockBcryptHash = jest.mocked(bcrypt.hash);
const mockCloudinaryUpload = jest.mocked(cloudinary.uploader.upload_stream);

const app: express.Application = express();
app.use(express.json());
app.use('/api/users', router);

describe('User Registration API', () => {
  const testUser: IUser = new User({
    firstname: 'John',
    lastname: 'Doe',
    email: 'john.doe@example.com',
    password: 'password123',
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should register a new user with a profile image', async () => {
    (mockFindUserByEmail as jest.Mock).mockResolvedValue(null);
    (mockUserValidation as jest.Mock).mockReturnValue({ error: null }); 
    (mockBcryptGenSalt as jest.Mock).mockResolvedValue('salt');
    (mockBcryptHash as jest.Mock).mockResolvedValue('hashedPassword');
    (mockCreateUser as jest.Mock).mockResolvedValue({
      ...testUser,
      _id: '1',
      firstname: testUser.firstname,
      lastname: testUser.lastname,
      email: testUser.email,
      profileImage: 'http://cloudinary.com/profile.jpg',
      generateAuthToken: jest.fn(),
    });

    (mockCloudinaryUpload as jest.MockedClass<typeof mockCloudinaryUpload>).mockImplementation((callback: any) => ({
      end: (buffer: Buffer) => callback(null, { secure_url: 'http://cloudinary.com/profile.jpg' }),
    }));

    const response = await request(app)
      .post('/api/users')
      .field('firstname', testUser.firstname || '')
      .field('lastname', testUser.lastname)
      .field('email', testUser.email)
      .field('password', testUser.password)
      .attach('profileImage', Buffer.from('test image'), 'test.jpg');

    expect(response.status).toBe(200);
    expect(response.header).toHaveProperty('x-auth-token');
    expect(response.body).toMatchObject({
      _id: expect.any(String),
      firstname: testUser.firstname,
      lastname: testUser.lastname,
      email: testUser.email,
      profileImage: 'http://cloudinary.com/profile.jpg',
    });
  });

  it('should register a new user without a profile image', async () => {
    (mockFindUserByEmail as jest.Mock).mockResolvedValue(null);
    (mockUserValidation as jest.Mock).mockReturnValue({ error: null }); 
    (mockBcryptGenSalt as jest.Mock).mockResolvedValue('salt');
    (mockBcryptHash as jest.Mock).mockResolvedValue('hashedPassword');
    (mockCreateUser as jest.Mock).mockResolvedValue({
      ...testUser,
      _id: '1',
      firstname: testUser.firstname,
      lastname: testUser.lastname,
      email: testUser.email,
      profileImage: '',
      generateAuthToken: jest.fn(),
    });

    const response = await request(app)
      .post('/api/users')
      .send(testUser);

    expect(response.status).toBe(200);
    expect(response.header).toHaveProperty('x-auth-token');
    expect(response.body).toMatchObject({
      _id: expect.any(String),
      firstname: testUser.firstname,
      lastname: testUser.lastname,
      email: testUser.email,
      profileImage: '',
    });
  });

  it('should return 400 if user already registered', async () => {
    (mockFindUserByEmail as jest.Mock).mockResolvedValue(testUser);
    (mockUserValidation as jest.Mock).mockReturnValue({ error: null }); 

    const response = await request(app)
      .post('/api/users')
      .send(testUser);

    expect(response.status).toBe(400);
    expect(response.text).toBe('User already registered.');
  });

  it('should return 400 if validation fails', async () => {
    (mockUserValidation as jest.Mock).mockReturnValue({ error: { details: [{ message: 'Validation error' }] } });
    const response = await request(app)
      .post('/api/users')
      .send(testUser);

    expect(response.status).toBe(400);
    expect(response.text).toBe('Validation error');
  });

  it('should return 500 if image upload fails', async () => {
    (mockFindUserByEmail as jest.Mock).mockResolvedValue(null);
    (mockUserValidation as jest.Mock).mockReturnValue({ error: null }); 
    (mockCloudinaryUpload as jest.MockedClass<typeof mockCloudinaryUpload>).mockImplementation((callback: any) => ({
      end: (buffer: Buffer) => callback(new Error('Upload error')),
    }));

    const response = await request(app)
      .post('/api/users')
      .field('firstname', testUser.firstname || '')
      .field('lastname', testUser.lastname)
      .field('email', testUser.email)
      .field('password', testUser.password)
      .attach('profileImage', Buffer.from('test image'), 'test.jpg');

    expect(response.status).toBe(500);
    expect(response.text).toBe('Error uploading image: Upload error');
  });
});
