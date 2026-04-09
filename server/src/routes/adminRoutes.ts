import express from 'express';
import {
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
} from '../controllers/adminController';
import { protect, admin } from '../middleware/auth';

const router = express.Router();

router.use(protect);
router.use(admin);

router.route('/users').get(getUsers);
router.route('/users/:id').delete(deleteUser).put(updateUser);
router.route('/customers').get(getCustomers).post(addCustomer);
router.route('/customers/:id').delete(deleteCustomer);
router.route('/leaves').get(getAllLeaves);
router.route('/leaves/:id').put(updateLeaveStatus);
router.route('/balances/global').put(updateGlobalBalances);
router.route('/tasks').get(getAllTasks).post(assignTask);
router.route('/tasks/:id').delete(deleteTask);
router.route('/holidays').get(getHolidays).post(addHoliday);
router.route('/holidays/:id').delete(deleteHoliday);
router.route('/salary').get(getAllSalarySlips).post(generateSalarySlip);
router.route('/salary/:id').put(updateSalarySlip).delete(deleteSalarySlip);
router.route('/attendance').get(getAllAttendance);
router.route('/site-visits').get(getAllSiteVisits);
router.route('/notices').get(getAdminNotices).post(addNotice);
router.route('/notices/:id').delete(deleteNotice);
router.route('/conveyance').get(getAllConveyances);
router.route('/conveyance/:id').put(updateConveyanceStatus);

export default router;
