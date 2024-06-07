import express, { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import _ from 'lodash';
import multer, { Multer } from 'multer';
import validateUser from '../validation/userValidation';
import { UploadApiResponse } from 'cloudinary'; 
import cloudinary from '../config/cloudinary';
import { findUserByEmail, createUser } from '../repository/users';
import {User} from '../models/user'


const router = express.Router();

const storage = multer.memoryStorage();
export const upload: Multer = multer({ storage: storage });

router.post('/', upload.single('profileImage'), async (req: Request, res: Response, next: NextFunction) => {
  const { error } = validateUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await findUserByEmail(req.body.email);
  if (user) return res.status(400).send('User already registered.');

  let profileImageUrl = '';
  if (req.file) {
    try {
      const result: UploadApiResponse | undefined = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream((error, result) => {
          if (error) reject(error);
          resolve(result);
        }).end(req.file!.buffer);
      });
      profileImageUrl = result!.secure_url;
    } catch (err: any) {
      return res.status(500).send('Error uploading image: ' + err.message);
    }
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  const newUser = new User ({
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    email: req.body.email,
    password: hashedPassword,
    profileImage: profileImageUrl
  });

  user = await createUser(newUser);

  const token = user.generateAuthToken();
  res.header('x-auth-token', token).send(_.pick(user, ['_id', 'firstname', 'lastname', 'email', 'profileImage']));
});

export default router;
