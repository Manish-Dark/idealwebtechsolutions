import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Force path to .env
dotenv.config({ path: path.join(process.cwd(), '.env') });

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://mmanish9205:manish123@cluster0.ndxwywe.mongodb.net/company_software?retryWrites=true&w=majority";

const checkDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    const User = mongoose.model('User', new mongoose.Schema({ name: String, role: String }));
    const Attendance = mongoose.model('Attendance', new mongoose.Schema({ user: mongoose.Schema.Types.ObjectId, date: Date }));

    const userCount = await User.countDocuments({});
    const employeeCount = await User.countDocuments({ role: 'user' });
    const attendanceCount = await Attendance.countDocuments({});

    console.log(`Total Users: ${userCount}`);
    console.log(`Employees (role: user): ${employeeCount}`);
    console.log(`Total Attendance Records: ${attendanceCount}`);

    const sampleUsers = await User.find({ role: 'user' }).limit(5);
    console.log("Sample Employees:", JSON.stringify(sampleUsers, null, 2));

    process.exit(0);
  } catch (err) {
    console.error("DB Check Error:", err);
    process.exit(1);
  }
};

checkDB();
