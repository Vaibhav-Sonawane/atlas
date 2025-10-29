// const express = require('express');
// const { authenticateToken } = require('../middleware/authMiddleware');
// const { checkRole } = require('../middleware/roleCheck');
// const Task = require('../models/Task');
// const Submission = require('../models/Submission');
import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { checkRole } from "../middleware/roleCheck.js";
import Task from "../models/Task.js";
import Submission from "../models/Submission.js";
import User from "../models/User.js";

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

export default router;