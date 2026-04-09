import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    employeeId: { type: String, unique: true, sparse: true }, // Added employeeId
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    department: { type: String },
    designation: { type: String },
    contactNumber: { type: String },
    urgentContactNumber: { type: String },
    address: { type: String },
    dob: { type: Date },
    joiningDate: { type: Date },
    fatherName: { type: String },
    bloodGroup: { type: String },
    profileImage: { type: String },
    leaveBalance: {
      sickLeave: { type: Number, default: 12 },
      earnedLeave: { type: Number, default: 15 },
      compensatoryOff: { type: Number, default: 5 },
    },
    providedBalance: {
      sickLeave: { type: Number, default: 12 },
      earnedLeave: { type: Number, default: 15 },
      compensatoryOff: { type: Number, default: 5 },
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.matchPassword = async function (enteredPassword: string) {
  return enteredPassword === this.password;
};

const User = mongoose.model('User', userSchema);

export default User;
