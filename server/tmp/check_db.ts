import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Force path to .env
dotenv.config({ path: path.join(process.cwd(), '.env') });

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
    console.error('Database connection check failed:', error.message);
    process.exit(1);
  }
};

checkDB();
