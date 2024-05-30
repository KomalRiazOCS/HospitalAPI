import mongoose from 'mongoose';
import config from 'config';

export function connectDB() {
    return mongoose.connect(config.get('db') as string, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false })
        .then(() => console.log(`Connected to ${config.get('db')}...`))
        .catch(err => console.error(`Could not connect to ${config.get('db')}...${err}`));
}

