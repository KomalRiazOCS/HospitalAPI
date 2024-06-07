import mongoose, { Schema, Document, Model } from 'mongoose';
import jwt from 'jsonwebtoken';
import config from 'config';

interface IUser extends Document {
  firstname?: string;
  lastname: string;
  email: string;
  password: string;
  profileImage?: string;
  generateAuthToken(): string;
}

const userSchema: Schema<IUser> = new mongoose.Schema({
  firstname: {
    type: String,
    minlength: 1,
    maxlength: 50
  },
  lastname: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    unique: true
  },
  password: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 1024
  },
  profileImage: {
    type: String,
    default: ''
  }
});

userSchema.methods.generateAuthToken = function(this: IUser): string {
  const token = jwt.sign({ _id: this._id }, config.get('jwtprivatekey'));
  return token;
};

const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);

export { User, IUser };
