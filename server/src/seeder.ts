import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || '');
    console.log('Connected to MongoDB');

    // Clean existing users
    await User.deleteMany({});

    // Create Admin
    const admin = await User.create({
      name: 'Admin User',
      employeeId: 'ADM001',
      email: 'admin@gmail.com',
      password: 'admin123',
      role: 'admin',
      department: 'Management',
      contactNumber: '1234567890',
      address: 'Company HQ',
      dob: new Date('1990-01-01'),
      joiningDate: new Date('2024-01-01'),
      fatherName: 'System admin',
      bloodGroup: 'O+',
      leaveBalance: { sickLeave: 12, earnedLeave: 15, compensatoryOff: 5 }
    });

    console.log('Admin User Created:', admin.email);

    // Create a regular user
    const user = await User.create({
      name: 'Regular User',
      employeeId: 'EMP001',
      email: 'user@gmail.com',
      password: 'user123',
      role: 'user',
      department: 'Engineering',
      contactNumber: '0987654321',
      address: 'User Home',
      dob: new Date('1995-05-05'),
      joiningDate: new Date('2023-01-01'),
      fatherName: 'Regular Father',
      bloodGroup: 'A+',
      leaveBalance: { sickLeave: 12, earnedLeave: 15, compensatoryOff: 5 }
    });

    console.log('Employee User Created:', user.email);

    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
