import { Request, Response } from 'express';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Search by email OR employeeId
  const user: any = await User.findOne({ 
    $or: [{ email: email }, { employeeId: email }] 
  });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      employeeId: user.employeeId,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
};

// @desc    Register a new user
// @route   POST /api/users
// @access  Admin
const registerUser = async (req: Request, res: Response) => {
  const { name, email, employeeId, password, role, department, designation, contactNumber, urgentContactNumber, address, dob, joiningDate, fatherName, bloodGroup } = req.body;

  const userExists = await User.findOne({ $or: [{ email }, { employeeId }] });

  if (userExists) {
    res.status(400).json({ message: 'User already exists' });
    return;
  }

  const finalPassword = password || 'Pitech@123';

  const user = await User.create({
    name,
    email,
    employeeId,
    password: finalPassword,
    role,
    department,
    designation,
    contactNumber,
    urgentContactNumber,
    address,
    dob,
    joiningDate,
    fatherName,
    bloodGroup,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      employeeId: user.employeeId,
      role: user.role,
    });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req: any, res: Response) => {
  const user = await User.findById(req.user._id);

  if (user) {
    // Self-healing logic for existing users missing the new providedBalance field
    if (!user.providedBalance || !user.providedBalance.sickLeave) {
      user.providedBalance = {
        sickLeave: user.leaveBalance?.sickLeave || 0,
        earnedLeave: user.leaveBalance?.earnedLeave || 0,
        compensatoryOff: user.leaveBalance?.compensatoryOff || 0
      };
      await user.save();
    }
    res.json(user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Update user password
// @route   PUT /api/users/profile/password
// @access  Private
const updatePassword = async (req: any, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const user: any = await User.findById(req.user._id);

  if (user && (await user.matchPassword(currentPassword))) {
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } else {
    res.status(401).json({ message: 'Invalid current password' });
  }
};

export { authUser, registerUser, getUserProfile, updatePassword };
