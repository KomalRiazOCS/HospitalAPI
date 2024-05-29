// startup/db.ts
import mongoose from 'mongoose';

export function connectDB() {
    const db = process.env.DB_URL || 'mongodb://localhost/hospitalApi';
    return mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => console.log('Connected to MongoDB...'))
        .catch((err: Error) => {
            console.error('Could not connect to MongoDB...', err);
            throw err;
        });
}

