import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const checkDB = async () => {
  try {
    if (!MONGO_URI) {
      throw new Error('MONGO_URI environment variable is missing.');
    }
    const conn = await mongoose.connect(MONGO_URI);
    console.log(`Database connection successful: ${conn.connection.host}`);
    await mongoose.disconnect();
  } catch (error: any) {
    console.error('Database check failed:', error.message);
    process.exit(1);
  }
};

checkDB();
