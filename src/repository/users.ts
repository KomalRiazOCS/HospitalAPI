import { User, IUser } from '../models/user';

async function findUserByEmail(email: string): Promise<IUser | null> {
  return await User.findOne({ email });
}

async function createUser(userData: IUser): Promise<IUser> {
  const user = new User(userData);
  return await user.save();
}

async function findUserById(id: string): Promise<IUser | null> {
  return await User.findById(id).select('-password');
}

export { findUserByEmail, createUser, findUserById };
