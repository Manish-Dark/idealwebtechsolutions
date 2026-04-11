import express from 'express';
import { authUser, registerUser, getUserProfile, updatePassword } from '../controllers/userController.js';
import {
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
  getCustomersForUser,
} from '../controllers/userActionController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/login', authUser);

// Private routes (All users)
router.route('/profile').get(protect, getUserProfile);
router.route('/profile/password').put(protect, updatePassword);
router.route('/attendance')
  .post(protect, markAttendance)
  .get(protect, getAttendanceHistory);
router.route('/leaves')
  .post(protect, applyLeave)
  .get(protect, getMyLeaves);
router.route('/tasks').get(protect, getUserTasks);
router.route('/tasks/:id/progress').put(protect, updateTaskProgress);
router.route('/conveyance')
  .post(protect, submitConveyance)
  .get(protect, getMyConveyances);
router.route('/site-visit').post(protect, logSiteVisit);
router.route('/site-visits').get(protect, getMySiteVisits);
router.route('/customers').get(protect, getCustomersForUser);
router.route('/salary').get(protect, getSalarySlips);
router.route('/holidays').get(protect, getHolidays);
router.route('/notices').get(protect, getUserNotices);
router.route('/mood')
  .get(protect, getMoodHistory)
  .post(protect, saveMood);

// Admin only routes for user management
router.route('/').post(protect, admin, registerUser);

export default router;
