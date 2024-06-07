import mongoose from 'mongoose';
import config from 'config';

export default async function connectToDatabase() {
  const db: string = config.get('db');
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
    });
    console.log(`Connected to ${db}...`);
  } catch (err) {
    console.error('Could not connect to MongoDB...', err);
    process.exit(1);
  }
}
