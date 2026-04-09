import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://mmanish9205:manish123@cluster0.ndxwywe.mongodb.net/company_software?retryWrites=true&w=majority";

const checkDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    const User = mongoose.model('User', new mongoose.Schema({ name: String, role: String }));
    const Attendance = mongoose.model('Attendance', new mongoose.Schema({ user: mongoose.Schema.Types.ObjectId, date: Date }));

    const attendanceRecords = await Attendance.find({}).lean();
    console.log("Attendance Records:", JSON.stringify(attendanceRecords, null, 2));

    const users = await User.find({}).lean();
    console.log("Users in DB:", JSON.stringify(users, null, 2));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkDB();
