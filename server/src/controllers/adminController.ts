import { Request, Response } from 'express';
import User from '../models/User.js';
import Leave from '../models/Leave.js';
import Task from '../models/Task.js';
import Holiday from '../models/Holiday.js';
import SalarySlip from '../models/SalarySlip.js';
import Attendance from '../models/Attendance.js';
import Customer from '../models/Customer.js';
import SiteVisit from '../models/SiteVisit.js';
import Notice from '../models/Notice.js';
import Conveyance from '../models/Conveyance.js';

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Admin
const getUsers = async (req: Request, res: Response) => {
  const users = await User.find({}).select('-password');
  res.json(users);
};

// @desc    Get all leave requests
// @route   GET /api/admin/leaves
// @access  Admin
const getAllLeaves = async (req: Request, res: Response) => {
  const leaves = await Leave.find({}).populate('user', 'name employeeId');
  res.json(leaves);
};

// @desc    Approve/Reject leave
// @route   PUT /api/admin/leaves/:id
// @access  Admin
const updateLeaveStatus = async (req: Request, res: Response) => {
  const { status, adminNote } = req.body;
  const leave = await Leave.findById(req.params.id);

  if (leave) {
    const oldStatus = leave.status;
    const start = new Date(leave.startDate);
    const end = new Date(leave.endDate);
    const days = Math.round((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1;
    
    console.log(`[DEBUG] LeaveID: ${leave._id}, Type: ${leave.type}, Days: ${days}`);
    console.log(`[DEBUG] Transition: ${oldStatus} -> ${status}`);

    // Update leave details
    leave.status = status || leave.status;
    leave.adminNote = adminNote || leave.adminNote;
    const updatedLeave = await leave.save();

    // Handle balance deduction/refund
    if (oldStatus !== 'Approved' && status === 'Approved') {
      let updateField = '';
      if (leave.type === 'Sick Leave') updateField = 'leaveBalance.sickLeave';
      else if (leave.type === 'Earned Leave') updateField = 'leaveBalance.earnedLeave';
      else if (leave.type === 'COFF') updateField = 'leaveBalance.compensatoryOff';

      if (updateField) {
        console.log(`[DEBUG] Attempting to deduct ${days} from ${updateField} for user ${leave.user}`);
        const result = await User.updateOne(
          { _id: leave.user },
          { $inc: { [updateField]: -days } }
        );
        console.log(`[DEBUG] Update Result: ${JSON.stringify(result)}`);
      } else {
        console.log(`[DEBUG] No matching updateField for type: "${leave.type}"`);
      }
    } else if (oldStatus === 'Approved' && status === 'Rejected') {
      let updateField = '';
      if (leave.type === 'Sick Leave') updateField = 'leaveBalance.sickLeave';
      else if (leave.type === 'Earned Leave') updateField = 'leaveBalance.earnedLeave';
      else if (leave.type === 'COFF') updateField = 'leaveBalance.compensatoryOff';

      if (updateField) {
        console.log(`[DEBUG] Attempting to refund ${days} to ${updateField} for user ${leave.user}`);
        const result = await User.updateOne(
          { _id: leave.user },
          { $inc: { [updateField]: days } }
        );
        console.log(`[DEBUG] Refund Result: ${JSON.stringify(result)}`);
      }
    }

    res.json(updatedLeave);
  } else {
    res.status(404).json({ message: 'Leave request not found' });
  }
};

// @desc    Assign task to user
// @route   POST /api/admin/tasks
// @access  Admin
const assignTask = async (req: any, res: Response) => {
  const { title, description, assignedTo, deadline } = req.body;

  const task = await Task.create({
    title,
    description,
    assignedTo,
    assignedBy: req.user._id,
    deadline,
  });

  if (task) {
    res.status(201).json(task);
  } else {
    res.status(400).json({ message: 'Invalid task data' });
  }
};

// @desc    Get all assigned tasks
// @route   GET /api/admin/tasks
// @access  Admin
const getAllTasks = async (req: Request, res: Response) => {
  const tasks = await Task.find({}).populate('assignedTo', 'name employeeId').populate('assignedBy', 'name').sort({ createdAt: -1 });
  res.json(tasks);
};

// @desc    Delete task
// @route   DELETE /api/admin/tasks/:id
// @access  Admin
const deleteTask = async (req: Request, res: Response) => {
  const task = await Task.findById(req.params.id);
  if (task) {
    await Task.deleteOne({ _id: task._id });
    res.json({ message: 'Task removed successfully' });
  } else {
    res.status(404).json({ message: 'Task not found' });
  }
};

// @desc    Add company holiday
// @route   POST /api/admin/holidays
// @access  Admin
const addHoliday = async (req: Request, res: Response) => {
  const { title, date, type } = req.body;

  const holiday = await Holiday.create({ title, date, type });

  if (holiday) {
    res.status(201).json(holiday);
  } else {
    res.status(400).json({ message: 'Invalid holiday data' });
  }
};

// @desc    Get all holidays
// @route   GET /api/admin/holidays
// @access  Admin
const getHolidays = async (req: Request, res: Response) => {
  const holidays = await Holiday.find({}).sort({ date: 1 });
  res.json(holidays);
};

// @desc    Delete holiday
// @route   DELETE /api/admin/holidays/:id
// @access  Admin
const deleteHoliday = async (req: Request, res: Response) => {
  const holiday = await Holiday.findById(req.params.id);
  if (holiday) {
    await Holiday.deleteOne({ _id: holiday._id });
    res.json({ message: 'Holiday removed successfully' });
  } else {
    res.status(404).json({ message: 'Holiday not found' });
  }
};

// @desc    Generate salary slip
// @route   POST /api/admin/salary
// @access  Admin
const generateSalarySlip = async (req: Request, res: Response) => {
  const { user, month, year, paidDays, presentDays, absentDays, leaveDays, halfDays, basicSalary, hra, conveyance, totalDeduction, designation, department } = req.body;

  const grossEarning = Number(basicSalary) + Number(hra || 0) + Number(conveyance || 0);
  const netSalary = grossEarning - Number(totalDeduction || 0);

  const salarySlip = await SalarySlip.create({
    user,
    month,
    year,
    paidDays,
    presentDays,
    absentDays,
    leaveDays,
    halfDays,
    basicSalary,
    hra,
    conveyance,
    grossEarning,
    totalDeduction,
    netSalary,
    designation,
    department
  });

  if (salarySlip) {
    res.status(201).json(salarySlip);
  } else {
    res.status(400).json({ message: 'Invalid salary data' });
  }
};

// @desc    Update global leave balances for all users
// @route   PUT /api/admin/balances/global
// @access  Admin
const updateGlobalBalances = async (req: Request, res: Response) => {
  const { sickLeave, earnedLeave, compensatoryOff } = req.body;

  try {
    const result = await User.updateMany(
      { role: 'user' }, // Only update regular users, not admins
      {
        $set: {
          'leaveBalance.sickLeave': sickLeave,
          'leaveBalance.earnedLeave': earnedLeave,
          'leaveBalance.compensatoryOff': compensatoryOff,
          'providedBalance.sickLeave': sickLeave,
          'providedBalance.earnedLeave': earnedLeave,
          'providedBalance.compensatoryOff': compensatoryOff,
        },
      }
    );

    res.json({ message: `Successfully updated balances for ${result.modifiedCount} employees`, result });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Admin
const deleteUser = async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);

  if (user) {
    if (user.role === 'admin') {
      res.status(400).json({ message: 'Cannot delete admin users' });
      return;
    }
    await User.deleteOne({ _id: user._id });
    res.json({ message: 'User removed successfully' });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Admin
const updateUser = async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.employeeId = req.body.employeeId || user.employeeId;
    user.role = req.body.role || user.role;
    user.department = req.body.department || user.department;
    user.contactNumber = req.body.contactNumber || user.contactNumber;
    user.urgentContactNumber = req.body.urgentContactNumber || user.urgentContactNumber;
    user.address = req.body.address || user.address;
    user.fatherName = req.body.fatherName || user.fatherName;
    user.bloodGroup = req.body.bloodGroup || user.bloodGroup;
    user.designation = req.body.designation || user.designation;
    
    const updatedUser = await user.save();
    res.json(updatedUser);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Add customer
// @route   POST /api/admin/customers
// @access  Admin
const addCustomer = async (req: Request, res: Response) => {
  const customer = await Customer.create(req.body);
  if (customer) {
    res.status(201).json(customer);
  } else {
    res.status(400).json({ message: 'Invalid customer data' });
  }
};

// @desc    Get customers
// @route   GET /api/admin/customers
// @access  Admin
const getCustomers = async (req: Request, res: Response) => {
  const customers = await Customer.find({}).sort({ createdAt: -1 });
  res.json(customers);
};

// @desc    Delete customer
// @route   DELETE /api/admin/customers/:id
// @access  Admin
const deleteCustomer = async (req: Request, res: Response) => {
  const customer = await Customer.findById(req.params.id);
  if (customer) {
    await Customer.deleteOne({ _id: customer._id });
    res.json({ message: 'Customer removed' });
  } else {
    res.status(404).json({ message: 'Customer not found' });
  }
};

// @desc    Update customer
// @route   PUT /api/admin/customers/:id
// @access  Admin
const updateCustomer = async (req: Request, res: Response) => {
  const customer = await Customer.findById(req.params.id);
  if (customer) {
    customer.name = req.body.name || customer.name;
    customer.email = req.body.email || customer.email;
    customer.phone = req.body.phone || customer.phone;
    customer.company = req.body.company || customer.company;
    customer.address = req.body.address || customer.address;
    customer.notes = req.body.notes || customer.notes;

    const updatedCustomer = await customer.save();
    res.json(updatedCustomer);
  } else {
    res.status(404).json({ message: 'Customer not found' });
  }
};

// @desc    Get all student attendance records
// @route   GET /api/admin/attendance
// @access  Admin
const getAllAttendance = async (req: Request, res: Response) => {
  const attendance = await Attendance.find({}).populate('user', 'name employeeId').sort({ date: -1 });
  res.json(attendance);
};

// @desc    Get all site visits
// @route   GET /api/admin/site-visits
// @access  Admin
const getAllSiteVisits = async (req: Request, res: Response) => {
  const visits = await SiteVisit.find({})
    .populate('user', 'name employeeId')
    .populate('customer', 'name company')
    .sort({ date: -1 });
  res.json(visits);
};

// @desc    Add notice
// @route   POST /api/admin/notices
// @access  Admin
const addNotice = async (req: Request, res: Response) => {
  const { title, content, priority } = req.body;
  const notice = await Notice.create({ title, content, priority });
  res.status(201).json(notice);
};

// @desc    Get all notices
// @route   GET /api/admin/notices
// @access  Admin
const getAdminNotices = async (req: Request, res: Response) => {
  const notices = await Notice.find({}).sort({ createdAt: -1 });
  res.json(notices);
};

// @desc    Delete notice
// @route   DELETE /api/admin/notices/:id
// @access  Admin
const deleteNotice = async (req: Request, res: Response) => {
  const notice = await Notice.findById(req.params.id);
  if (notice) {
    await Notice.deleteOne({ _id: notice._id });
    res.json({ message: 'Notice removed' });
  } else {
    res.status(404).json({ message: 'Notice not found' });
  }
};

// @desc    Get all salary slips
// @route   GET /api/admin/salary
// @access  Admin
const getAllSalarySlips = async (req: Request, res: Response) => {
  const slips = await SalarySlip.find({}).populate('user', 'name employeeId').sort({ generatedAt: -1 });
  res.json(slips);
};

// @desc    Update salary slip
// @route   PUT /api/admin/salary/:id
// @access  Admin
const updateSalarySlip = async (req: Request, res: Response) => {
  const { paidDays, presentDays, absentDays, leaveDays, halfDays, basicSalary, hra, conveyance, totalDeduction, designation, department } = req.body;

  const slip = await SalarySlip.findById(req.params.id);

  if (slip) {
    const grossEarning = Number(basicSalary) + Number(hra || 0) + Number(conveyance || 0);
    const netSalary = grossEarning - Number(totalDeduction || 0);

    slip.paidDays = paidDays ?? slip.paidDays;
    slip.presentDays = presentDays ?? slip.presentDays;
    slip.absentDays = absentDays ?? slip.absentDays;
    slip.leaveDays = leaveDays ?? slip.leaveDays;
    slip.halfDays = halfDays ?? slip.halfDays;
    slip.basicSalary = basicSalary ?? slip.basicSalary;
    slip.hra = hra ?? slip.hra;
    slip.conveyance = conveyance ?? slip.conveyance;
    slip.grossEarning = grossEarning;
    slip.totalDeduction = totalDeduction ?? slip.totalDeduction;
    slip.netSalary = netSalary;
    slip.designation = designation ?? slip.designation;
    slip.department = department ?? slip.department;

    const updatedSlip = await slip.save();
    res.json(updatedSlip);
  } else {
    res.status(404).json({ message: 'Salary slip not found' });
  }
};

// @desc    Delete salary slip
// @route   DELETE /api/admin/salary/:id
// @access  Admin
const deleteSalarySlip = async (req: Request, res: Response) => {
  const slip = await SalarySlip.findById(req.params.id);

  if (slip) {
    await SalarySlip.deleteOne({ _id: slip._id });
    res.json({ message: 'Salary slip removed successfully' });
  } else {
    res.status(404).json({ message: 'Salary slip not found' });
  }
};

// @desc    Get all conveyances
// @route   GET /api/admin/conveyance
// @access  Admin
const getAllConveyances = async (req: Request, res: Response) => {
  try {
    const conveyances = await Conveyance.find({})
      .populate('user', 'name employeeId')
      .sort({ createdAt: -1 });
    res.json(conveyances);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update conveyance status
// @route   PUT /api/admin/conveyance/:id
// @access  Admin
const updateConveyanceStatus = async (req: Request, res: Response) => {
  const { status } = req.body;
  try {
    const conveyance = await Conveyance.findById(req.params.id);
    if (conveyance) {
      conveyance.status = status || conveyance.status;
      const updatedConveyance = await conveyance.save();
      res.json(updatedConveyance);
    } else {
      res.status(404).json({ message: 'Conveyance claim not found' });
    }
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export {
  getUsers,
  getAllLeaves,
  updateLeaveStatus,
  assignTask,
  addHoliday,
  generateSalarySlip,
  updateGlobalBalances,
  deleteUser,
  getAllAttendance,
  getAllTasks,
  deleteTask,
  updateUser,
  addCustomer,
  getCustomers,
  deleteCustomer,
  updateCustomer,
  getHolidays,
  deleteHoliday,
  getAllSiteVisits,
  getAdminNotices,
  deleteNotice,
  addNotice,
  getAllSalarySlips,
  updateSalarySlip,
  deleteSalarySlip,
  getAllConveyances,
  updateConveyanceStatus
};
