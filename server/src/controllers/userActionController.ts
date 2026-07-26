import { Request, Response } from 'express';
import Attendance from '../models/Attendance.js';
import Leave from '../models/Leave.js';
import Task from '../models/Task.js';
import Conveyance from '../models/Conveyance.js';
import SiteVisit from '../models/SiteVisit.js';
import Customer from '../models/Customer.js';
import SalarySlip from '../models/SalarySlip.js';
import Holiday from '../models/Holiday.js';
import Notice from '../models/Notice.js';
import Mood from '../models/Mood.js';

// @desc    Mark attendance
// @route   POST /api/users/attendance
// @access  Private
const markAttendance = async (req: any, res: Response) => {
  const { status, type, location, note } = req.body;

  if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
    return res.status(400).json({ message: 'GPS Location is mandatory to mark attendance. Please enable GPS and allow location access.' });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let attendance = await Attendance.findOne({
    user: req.user._id,
    date: { $gte: today },
  });

  if (type === 'check-out') {
    if (!attendance) {
      return res.status(400).json({ message: 'No check-in record found for today' });
    }
    attendance.checkOut = new Date();
    attendance.status = status || attendance.status;
    if (location) attendance.location = location;
    const updatedAttendance = await attendance.save();
    return res.json(updatedAttendance);
  } else {
    // Check-in (default)
    if (attendance) {
      return res.status(400).json({ message: 'Already checked in for today' });
    }
    const newAttendance = await Attendance.create({
      user: req.user._id,
      date: new Date(),
      status: status || 'Present',
      checkIn: new Date(),
      location,
      note,
    });
    res.status(201).json(newAttendance);
  }
};

// @desc    Get user attendance history
// @route   GET /api/user/attendance
// @access  Private
const getAttendanceHistory = async (req: any, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Not authorized' });
  const history = await Attendance.find({ user: req.user._id }).sort({ date: -1 });
  res.json(history);
};

// @desc    Apply for leave
// @route   POST /api/user/leaves
// @access  Private
const applyLeave = async (req: any, res: Response) => {
  try {
    const { type, startDate, endDate, reason, description } = req.body;
    console.log('Leave Application Body:', req.body);

    const leave = await Leave.create({
      user: req.user._id,
      type,
      startDate,
      endDate,
      reason,
      description,
    });

    res.status(201).json(leave);
  } catch (error: any) {
    console.error('Apply Leave Error:', error.message);
    res.status(400).json({ message: error.message || 'Invalid leave data' });
  }
};

// @desc    Get user leaves
// @route   GET /api/user/leaves
// @access  Private
const getMyLeaves = async (req: any, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Not authorized' });
  const leaves = await Leave.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(leaves);
};

// @desc    Get user tasks
// @route   GET /api/user/tasks
// @access  Private
const getUserTasks = async (req: any, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Not authorized' });
  const tasks = await Task.find({ assignedTo: req.user._id });
  res.json(tasks);
};

// @desc    Complete task
// @desc    Update task progress
// @route   PUT /api/users/tasks/:id/progress
// @access  Private
const updateTaskProgress = async (req: any, res: Response) => {
  const { progress } = req.body;
  const task = await Task.findById(req.params.id);

  if (task && task.assignedTo.toString() === req.user._id.toString()) {
    task.progress = progress;
    if (progress === 100) {
      task.status = 'Completed';
      task.completedAt = new Date();
    } else {
      task.status = 'Pending';
      task.completedAt = undefined;
    }
    const updatedTask = await task.save();
    res.json(updatedTask);
  } else {
    res.status(404).json({ message: 'Task not found' });
  }
};

// @desc    Submit conveyance
// @route   POST /api/user/conveyance
// @access  Private
const submitConveyance = async (req: any, res: Response) => {
  const { 
    date, 
    expenseType, 
    siteProjectName, 
    amount, 
    description,
    travelFrom,
    travelTo,
    transportMedium
  } = req.body;

  try {
    const conveyance = await Conveyance.create({
      user: req.user._id,
      date,
      expenseType,
      siteProjectName,
      amount,
      description,
      travelFrom,
      travelTo,
      transportMedium
    });

    res.status(201).json(conveyance);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get my conveyances
// @route   GET /api/user/conveyance
// @access  Private
const getMyConveyances = async (req: any, res: Response) => {
  try {
    const conveyances = await Conveyance.find({ user: req.user._id }).sort({ date: -1 });
    res.json(conveyances);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Log site visit
// @route   POST /api/users/site-visit
// @access  Private
const logSiteVisit = async (req: any, res: Response) => {
  const { 
    customer, 
    date, 
    contactPersonType, 
    contactPersonName, 
    contactPersonMobile, 
    contactPersonDesignation, 
    workDescription, 
    nextAction 
  } = req.body;

  try {
    const siteVisit = await SiteVisit.create({
      user: req.user._id,
      customer,
      date,
      contactPersonType,
      contactPersonName,
      contactPersonMobile,
      contactPersonDesignation,
      workDescription,
      nextAction,
    });

    res.status(201).json(siteVisit);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get my site visits
// @route   GET /api/users/site-visits
// @access  Private
const getMySiteVisits = async (req: any, res: Response) => {
  try {
    const visits = await SiteVisit.find({ user: req.user._id })
      .populate('customer', 'name company')
      .sort({ date: -1 });
    res.json(visits);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get customers for selection
// @route   GET /api/users/customers
// @access  Private
const getCustomersForUser = async (req: Request, res: Response) => {
  try {
    const customers = await Customer.find({}).select('name company phone');
    res.json(customers);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get salary slips
// @route   GET /api/user/salary
// @access  Private
const getSalarySlips = async (req: any, res: Response) => {
  const slips = await SalarySlip.find({ user: req.user._id });
  res.json(slips);
};

// @desc    Get public company holidays
// @route   GET /api/users/holidays
// @access  Private (All Employees)
const getHolidays = async (req: Request, res: Response) => {
  const holidays = await Holiday.find({}).sort({ date: 1 });
  res.json(holidays);
};

// @desc    Get notices for users
// @route   GET /api/users/notices
// @access  Private
const getUserNotices = async (req: Request, res: Response) => {
  const notices = await Notice.find({}).sort({ createdAt: -1 });
  res.json(notices);
};

// @desc    Save user mood
// @route   POST /api/users/mood
// @access  Private
const saveMood = async (req: any, res: Response) => {
  const { mood, note } = req.body;
  const newMood = await Mood.create({
    user: req.user._id,
    mood,
    note,
  });
  res.status(201).json(newMood);
};

// @desc    Get user mood history
// @route   GET /api/users/mood
// @access  Private
const getMoodHistory = async (req: any, res: Response) => {
  const history = await Mood.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(10);
  res.json(history);
};

export { 
  markAttendance, 
  getAttendanceHistory,
  applyLeave, 
  getMyLeaves, 
  getUserTasks, 
  updateTaskProgress, 
  submitConveyance, 
  logSiteVisit, 
  getSalarySlips,
  getHolidays,
  getUserNotices,
  saveMood,
  getMoodHistory,
  getMyConveyances,
  getMySiteVisits,
  getCustomersForUser
};
