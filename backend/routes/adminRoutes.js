import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { checkRole } from '../middleware/roleCheck.js';
import User from '../models/User.js';
import Task from '../models/Task.js';
import Submission from '../models/Submission.js';
import mongoose from 'mongoose';

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticateToken);
router.use(checkRole('admin'));

// Get system statistics
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalTeachers = await User.countDocuments({ role: 'teacher' });
    const totalTasks = await Task.countDocuments();
    const totalSubmissions = await Submission.countDocuments();

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('firstName lastName email role createdAt');

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalStudents,
          totalTeachers,
          totalTasks,
          totalSubmissions
        },
        recentUsers
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stats',
      error: error.message
    });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const { role, page = 1, limit = 10 } = req.query;
    const filter = {};

    if (role) filter.role = role;

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
});

// Update user status
router.put('/users/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: { user }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update user status',
      error: error.message
    });
  }
});

// Admin Global Leaderboard
router.get('/global-leaderboard', async (req, res) => {
  try {
    const leaderboard = await User.find({ role: 'student', isActive: true })
      .sort({ 'gamification.totalPoints': -1 })
      .select('firstName lastName email gamification')
      .limit(Number(req.query.limit) || 100);

    res.json({
      success: true,
      data: {
        leaderboard,
        period: req.query.period || 'all-time'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch global leaderboard', error: error.message });
  }
});

// Admin fetching specific user streak
router.get('/users/:id/streak', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({
      success: true,
      data: {
        currentStreak: user.gamification?.currentStreak || 0,
        highestStreak: user.gamification?.highestStreak || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch user streak', error: error.message });
  }
});

// Admin fetching specific user achievements
router.get('/users/:id/achievements', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({
      success: true,
      data: user.gamification?.badges || []
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch user achievements', error: error.message });
  }
});

// Admin fetching specific user progress
router.get('/users/:id/progress', async (req, res) => {
  try {
    const studentId = new mongoose.Types.ObjectId(req.params.id);
    const period = req.query.period || 'monthly';
    const dateLimit = new Date();

    if (period === 'weekly') dateLimit.setDate(dateLimit.getDate() - 7);
    else if (period === 'monthly') dateLimit.setMonth(dateLimit.getMonth() - 1);
    else dateLimit.setFullYear(2000);

    const progress = await Submission.aggregate([
      { $match: { student: studentId, status: 'graded', submittedAt: { $gte: dateLimit } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$submittedAt" } },
          points: { $sum: '$pointsEarned' },
          tasksCompleted: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        progress: progress.map(p => ({ date: p._id, points: p.points, tasksCompleted: p.tasksCompleted })),
        period
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch user progress', error: error.message });
  }
});

export default router;