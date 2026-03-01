import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { checkRole } from "../middleware/roleCheck.js";
import Submission from "../models/Submission.js";
import Task from "../models/Task.js";
import User from "../models/User.js";
import LeaderboardService from "../services/leaderboardService.js";
import StreakService from "../services/streakService.js";
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Make sure this folder exists
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.fieldname}${ext}`);
  }
});

const upload = multer({ storage });

// Apply auth and role middleware
router.use(authenticateToken);
router.use(checkRole('student'));

// GET all tasks for student (with optional filters)
router.get('/tasks', async (req, res) => {
  try {
    const { search, status, difficulty, category, sortBy } = req.query;
    const studentId = req.user._id;

    // Exclude tasks already submitted if status filter applies
    const submittedTaskIds = await Submission.find({ student: studentId })
      .distinct('task');

    let query = { isActive: true, _id: { $nin: submittedTaskIds } };

    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (search) query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { instructions: { $regex: search, $options: 'i' } }
    ];

    let tasksQuery = Task.find(query).populate('createdBy', 'firstName lastName email');

    // Apply sorting
    if (sortBy) {
      switch (sortBy) {
        case 'dueDate': tasksQuery = tasksQuery.sort({ dueDate: 1 }); break;
        case 'points': tasksQuery = tasksQuery.sort({ points: -1 }); break;
        case 'difficulty': tasksQuery = tasksQuery.sort({ difficulty: 1 }); break;
        case 'created': tasksQuery = tasksQuery.sort({ createdAt: -1 }); break;
        default: break;
      }
    }

    const tasks = await tasksQuery.limit(50); // optional limit

    res.json({
      success: true,
      data: tasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tasks',
      error: error.message
    });
  }
});

// GET single task by ID
router.get('/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('createdBy', 'firstName lastName email');
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch task', error: error.message });
  }
});

// GET all submissions
router.get('/submissions', async (req, res) => {
  try {
    const submissions = await Submission.find({ student: req.user._id })
      .populate('task', 'title category difficulty points dueDate')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: submissions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch submissions', error: error.message });
  }
});

// GET single submission by ID
// GET student's submission for a specific task
router.get('/submissions/task/:taskId', async (req, res) => {
  try {
    const submission = await Submission.findOne({
      student: req.user._id,
      task: req.params.taskId
    }).populate('task', 'title category difficulty points dueDate');

    res.json({ success: true, data: submission });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// POST submit task
router.post('/submit/:taskId', upload.array('attachments'), async (req, res) => {
  try {
    const { taskId } = req.params;
    const { textContent } = req.body;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const existingSubmission = await Submission.findOne({
      task: taskId,
      student: req.user._id
    });

    const submissionData = {
      task: taskId,
      student: req.user._id,
      textContent: textContent || '',
      attachments: req.files?.map(file => ({
        fileName: file.originalname,
        filePath: file.path,
        fileType: file.mimetype,
        fileSize: file.size
      })) || [],
      status: 'submitted',
      submittedAt: new Date()
    };

    let submission;
    if (existingSubmission) {
      submission = await Submission.findByIdAndUpdate(existingSubmission._id, submissionData, { new: true });
    } else {
      submission = await Submission.create(submissionData);
    }

    await submission.populate('task', 'title points');

    res.json({ success: true, message: 'Task submitted successfully', data: submission });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to submit task', error: error.message });
  }
});

// GET student dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const studentId = req.user._id;

    const recentSubmissions = await Submission.find({ student: studentId })
      .populate('task', 'title category points')
      .sort({ createdAt: -1 })
      .limit(5);

    const submittedTaskIds = await Submission.find({ student: studentId, status: 'submitted' })
      .distinct('task');

    const pendingTasks = await Task.find({
      _id: { $nin: submittedTaskIds },
      isActive: true,
      dueDate: { $gt: new Date() }
    }).limit(10);

    const totalSubmissions = await Submission.countDocuments({ student: studentId });
    const gradedSubmissions = await Submission.countDocuments({ student: studentId, status: 'graded' });

    res.json({
      success: true,
      data: {
        recentSubmissions,
        pendingTasks,
        stats: {
          totalSubmissions,
          gradedSubmissions,
          currentStreak: req.user.gamification.currentStreak,
          totalPoints: req.user.gamification.totalPoints
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard', error: error.message });
  }
});

// Get current student's streak
router.get('/streak', async (req, res) => {
  try {
    const streak = await StreakService.updateStreak(req.user._id);
    res.json({ success: true, data: { currentStreak: streak } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


router.get('/leaderboard', async (req, res) => {
  try {
    const period = req.query.period || 'all-time';
    const leaderboard = await LeaderboardService.getTimeBasedLeaderboard(period);
    res.json({ success: true, data: leaderboard });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get logged-in student's rank
router.get('/ranking', async (req, res) => {
  try {
    const period = req.query.period || 'all-time';
    const rank = await LeaderboardService.getUserRank(req.user._id, period);
    res.json({ success: true, data: { rank } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

//achievements and badges
router.get('/achievements', async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('gamification.badges');
    res.json({ success: true, data: user.gamification.badges });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/badges', async (req, res) => {
  try {
    const badges = ['week-warrior', 'month-master', 'century-champion', 'year-legend'];
    res.json({ success: true, data: badges });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


router.get('/leaderboard/statistics', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'student' });
    const topScorer = await User.findOne({ role: 'student' }).sort({ 'gamification.totalPoints': -1 }).select('firstName lastName gamification');

    res.json({
      success: true,
      data: {
        totalStudents: totalUsers,
        topScore: topScorer ? topScorer.gamification.totalPoints : 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/progress', async (req, res) => {
  try {
    const studentId = req.user._id;
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
    res.status(500).json({ success: false, message: error.message });
  }
});


export default router;
