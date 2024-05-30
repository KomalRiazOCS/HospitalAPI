import jwt from 'jsonwebtoken';
import config from 'config';
import {gameCodeSchema, IGameCode} from './gameCodes'
import mongoose, { Document, Schema, Model } from 'mongoose';

interface IUser extends Document {
  email: string;
  gameCodes: Array<Document & IGameCode>;
  loginAttempt: number;
  noOfGameCodes: number;
  generateAuthToken(): string;
}

const userSchema: Schema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  gameCodes: {
    type: [gameCodeSchema],
    default: []
  },
  loginAttempt: {
    type: Number,
    default: 0
  },
  noOfGameCodes: {
    type: Number,
    default: 0
  }
});

userSchema.methods.generateAuthToken = function (this: Document<any, any>): string {
  const token: string = jwt.sign({ _id: this._id }, config.get('jwtprivatekey'));
  return token;
};

const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);

export { User, IUser};
