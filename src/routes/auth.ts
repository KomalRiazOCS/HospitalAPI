import bcrypt from 'bcrypt';
import express, { Request, Response } from 'express';
import _ from 'lodash';
import validateAuth from '../validation/authValidation';
import { findUserByEmail } from '../repository/users';

const router = express.Router();

router.post('/', async (req: Request, res: Response) => {
  const { error } = validateAuth(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await findUserByEmail(req.body.email);
  if (!user) return res.status(400).send('Invalid email or password.');

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send('Invalid email or password.');

  const token = user.generateAuthToken();
  res.send(token);
});

export default router;
