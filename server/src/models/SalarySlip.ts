import mongoose from 'mongoose';

const salarySlipSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    month: { type: String, required: true },
    year: { type: Number, required: true },
    paidDays: { type: Number, default: 0 },
    presentDays: { type: Number, default: 0 },
    absentDays: { type: Number, default: 0 },
    leaveDays: { type: Number, default: 0 },
    halfDays: { type: Number, default: 0 },
    basicSalary: { type: Number, required: true },
    hra: { type: Number, default: 0 },
    conveyance: { type: Number, default: 0 },
    grossEarning: { type: Number, required: true },
    totalDeduction: { type: Number, default: 0 },
    netSalary: { type: Number, required: true },
    designation: { type: String },
    department: { type: String },
    status: { type: String, enum: ['Paid', 'Pending'], default: 'Paid' },
    generatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

const SalarySlip = mongoose.model('SalarySlip', salarySlipSchema);

export default SalarySlip;
