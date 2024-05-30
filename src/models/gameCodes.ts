import mongoose, { Document, Schema, Model } from 'mongoose';

interface IGameCode extends Document {
    code: string;
    createdAt: Date;
  }
  
  const gameCodeSchema: Schema = new mongoose.Schema({
    code: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: '12h'
    }
  });
  
  const GameCode: Model<IGameCode> = mongoose.model<IGameCode>('GameCode', gameCodeSchema);

  export { IGameCode, GameCode, gameCodeSchema};