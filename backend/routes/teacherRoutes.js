import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { checkRole } from "../middleware/roleCheck.js";
import Task from "../models/Task.js";
import Submission from "../models/Submission.js";
import User from "../models/User.js";
import path from "path";
import fs from "fs";

const router = express.Router();

// All routes require authentication and teacher role (or admin)
router.use(authenticateToken);
router.use(checkRole('teacher', 'admin'));

// Get teacher's tasks with submission stats
router.get('/tasks', async (req, res) => {
  try {
    const tasks = await Task.find({ createdBy: req.user._id }).sort({ createdAt: -1 });

    // For each task, count submissions
    const taskStats = await Promise.all(
      tasks.map(async (task) => {
        const submissionCount = await Submission.countDocuments({ task: task._id });
        const pendingReviews = await Submission.countDocuments({ task: task._id, status: 'submitted' });
        const gradedCount = await Submission.countDocuments({ task: task._id, status: 'graded' });

        return {
          ...task.toObject(),
          submissionCount,
          pendingReviews,
          gradedCount
        };
      })
    );

    res.json({
      success: true,
      data: { tasks: taskStats }
    });
  } catch (error) {
    console.error("Error fetching teacher tasks:", error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tasks',
      error: error.message
    });
  }
});

// Get submissions for review
router.get('/submissions', async (req, res) => {
  try {
    const { status = 'submitted', taskId } = req.query;

    let filter = { status };

    if (taskId) {
      filter.task = taskId;
    } else {
      // Only get submissions for tasks created by this teacher
      const teacherTasks = await Task.find({ createdBy: req.user._id }).distinct('_id');
      filter.task = { $in: teacherTasks };
    }

    const submissions = await Submission.find(filter)
      .populate('task', 'title category points')
      .populate('student', 'firstName lastName email')
      .sort({ submittedAt: -1 });

    res.json({
      success: true,
      data: { submissions }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch submissions',
      error: error.message
    });
  }
});

// Grade submission
router.put('/submissions/:id/grade', async (req, res) => {
  try {
    const { id } = req.params;
    const { grade } = req.body;
    const score = grade?.score;
    const feedback = grade?.feedback;

    if (score == null || score < 0 || score > 100) {
      return res.status(400).json({ success: false, message: 'Score must be between 0 and 100' });
    }

    const submission = await Submission.findById(id)
      .populate('task', 'points createdBy')
      .populate('student');

    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    if (submission.task.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You can only grade submissions for your own tasks' });
    }

    const pointsEarned = Math.floor((score / 100) * (submission.task.points || 0));

    submission.grade = {
      score,
      feedback,
      gradedBy: req.user._id,
      gradedAt: new Date()
    };
    submission.status = 'graded';
    submission.pointsEarned = pointsEarned;

    await submission.save();

    await User.findByIdAndUpdate(submission.student._id, { $inc: { 'gamification.totalPoints': pointsEarned } });

    res.json({ success: true, message: 'Submission graded successfully', data: { submission } });
  } catch (error) {
    console.error('Error grading submission:', error);
    res.status(500).json({ success: false, message: 'Failed to grade submission', error: error.message });
  }
});

// Download Submission Files
router.get('/submissions/:id/download', async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission || !submission.attachments || submission.attachments.length === 0) {
      return res.status(404).json({ success: false, message: 'No file found' });
    }
    // Simplification for first attachment, would need a zip normally for multiple
    const file = submission.attachments[0];
    const filePath = path.resolve(file.filePath);
    if (fs.existsSync(filePath)) {
      res.download(filePath, file.fileName);
    } else {
      res.status(404).json({ success: false, message: 'File not found on server' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error downloading file', error: error.message });
  }
});

// Get Teacher Dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const teacherId = req.user._id;
    const tasks = await Task.find({ createdBy: teacherId });
    const taskIds = tasks.map(t => t._id);
    const totalSubmissions = await Submission.countDocuments({ task: { $in: taskIds } });
    const pendingReviews = await Submission.countDocuments({ task: { $in: taskIds }, status: 'submitted' });

    res.json({
      success: true,
      data: {
        stats: {
          totalTasks: tasks.length,
          totalSubmissions,
          pendingReviews
        },
        recentActivity: [] // placeholder for future
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load dashboard', error: error.message });
  }
});

// Class Leaderboard (Teacher view)
router.get('/classes/:classId/leaderboard', async (req, res) => {
  try {
    const { classId } = req.params;

    // Find tasks created by this teacher
    const taskQuery = { createdBy: req.user._id };
    if (classId && classId !== 'all') {
      taskQuery.category = classId; // Treating classId as category for grouping if provided
    }
    const tasks = await Task.find(taskQuery);
    const taskIds = tasks.map(t => t._id);

    const leaderboard = await Submission.aggregate([
      { $match: { task: { $in: taskIds }, status: 'graded' } },
      {
        $group: {
          _id: '$student',
          points: { $sum: '$pointsEarned' },
          tasksCompleted: { $sum: 1 },
          avgGrade: { $avg: '$grade.score' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'studentInfo'
        }
      },
      { $unwind: '$studentInfo' },
      {
        $project: {
          id: '$_id',
          name: { $concat: ['$studentInfo.firstName', ' ', '$studentInfo.lastName'] },
          email: '$studentInfo.email',
          role: '$studentInfo.role',
          points: 1,
          tasksCompleted: 1,
          avgGrade: { $round: ['$avgGrade', 1] },
          streak: { $literal: 0 } // Mocked streak as no streak model exists
        }
      },
      { $sort: { points: -1 } },
      { $limit: parseInt(req.query.limit) || 10 }
    ]);

    res.json({
      success: true,
      count: leaderboard.length,
      data: leaderboard
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load class leaderboard', error: error.message });
  }
});

// Task Analytics
router.get('/tasks/:taskId/analytics', async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const totalSubmissions = await Submission.countDocuments({ task: task._id });
    const gradedSubmissions = await Submission.countDocuments({ task: task._id, status: 'graded' });
    const pendingSubmissions = await Submission.countDocuments({ task: task._id, status: { $in: ['submitted', 'reviewed'] } });

    const grades = await Submission.aggregate([
      { $match: { task: task._id, status: 'graded' } },
      {
        $group: {
          _id: null,
          avgGrade: { $avg: '$grade.score' },
          highestGrade: { $max: '$grade.score' },
          lowestGrade: { $min: '$grade.score' }
        }
      }
    ]);

    const gradeStats = grades.length > 0 ? grades[0] : { avgGrade: 0, highestGrade: 0, lowestGrade: 0 };
    const completionRate = task.assignedTo && task.assignedTo.length > 0 ? (totalSubmissions / task.assignedTo.length) * 100 : 0;

    res.json({
      success: true,
      data: {
        analytics: {
          totalSubmissions,
          gradedSubmissions,
          pendingSubmissions,
          completionRate: Math.round(completionRate),
          averageScore: gradeStats.avgGrade ? Math.round(gradeStats.avgGrade) : 0,
          highestGrade: gradeStats.highestGrade || 0,
          lowestGrade: gradeStats.lowestGrade || 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load analytics', error: error.message });
  }
});

// Submissions Analytics
router.get('/submissions/analytics', async (req, res) => {
  try {
    const tasks = await Task.find({ createdBy: req.user._id });
    const taskIds = tasks.map(t => t._id);

    const period = req.query.period || 'week'; // default to week
    const dateLimit = new Date();
    if (period === 'week') dateLimit.setDate(dateLimit.getDate() - 7);
    else if (period === 'month') dateLimit.setMonth(dateLimit.getMonth() - 1);
    else dateLimit.setFullYear(2000);

    const submissionTrends = await Submission.aggregate([
      { $match: { task: { $in: taskIds }, submittedAt: { $gte: dateLimit } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$submittedAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const statusCounts = await Submission.aggregate([
      { $match: { task: { $in: taskIds } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const counts = {};
    statusCounts.forEach(item => {
      counts[item._id] = item.count;
    });

    res.json({
      success: true,
      data: {
        analytics: {
          trends: submissionTrends.map(t => ({ date: t._id, count: t.count })),
          statusBreakdown: {
            draft: counts.draft || 0,
            submitted: counts.submitted || 0,
            reviewed: counts.reviewed || 0,
            graded: counts.graded || 0
          }
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load submissions analytics', error: error.message });
  }
});

export default router;