import Task from "../models/Task.js";
import { body, validationResult } from "express-validator";

// Validation rules (keep as is)
const taskValidation = [
  body('title').notEmpty().trim(),
  body('description').notEmpty().trim(),
  body('instructions').notEmpty().trim(),
  body('category').isIn([
    'MERN', 'HTML/CSS/JS', 'Python', 'Java', 'SQL',
    'MongoDB', 'React.js', 'Express.js/Node.js', 'C', 'C++', 'Others'
  ]),
  body('difficulty').optional().isIn(['easy', 'medium', 'hard']),
  body('points').isInt({ min: 1, max: 100 }),
  body('dueDate').isISO8601().toDate(),
  body('assignedTo').optional().isArray(),
  body('assignedTo.*').optional().isMongoId()
];

// Create Task
const createTask = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Only teachers/admins can create tasks (check role from req.user)
    if (!req.user || !['teacher', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const taskData = {
      ...req.body,
      createdBy: req.user._id,
      createdByRole: req.user.role
    };

    const task = await Task.create(taskData);
    await task.populate('createdBy', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: { task }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create task', error: error.message });
  }
};

// GET tasks for teacher(created by teacher and all by admin) and admin(all tasks)
const getAllTasks = async (req, res) => {
  try {
    const { category, difficulty, status, page = 1, limit = 10, sortBy = 'createdAt' } = req.query;

    const filter = {};

    // Filters
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (status === 'active') filter.isActive = true;
    else if (status === 'inactive') filter.isActive = false;

    // Role-based filtering
    if (req.user.role === 'teacher') {
      // Teachers see their tasks + tasks created by admins
      filter.$or = [
        { createdBy: req.user._id },
        { createdByRole: 'admin' },           // new admin tasks
        { createdBy: { $in: await User.find({ role: 'admin' }).distinct('_id') } } // old tasks
      ];
    }
    // Admins see everything → no filter needed

    const tasks = await Task.find(filter)
      .populate('createdBy', 'firstName lastName email')
      .sort({ [sortBy]: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Task.countDocuments(filter);

    res.json({
      success: true,
      data: { tasks },
      pagination: { current: Number(page), totalPages: Math.ceil(total / limit), total }
    });

  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch tasks', error: error.message });
  }
};

// Update Task
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    // Find the task
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Only the creator (teacher/admin) can update
    if (task.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    // Update task fields
    Object.assign(task, updatedData);
    await task.save();

    await task.populate('createdBy', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: { task }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update task', error: error.message });
  }
};

// Get Task By ID
const getTaskById = async (req, res) => {
  console.log("💡 Backend received ID:", req.params.id); // Add this
  try {
    const task = await Task.findById(req.params.id).lean();
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, data: { task } });
  } catch (error) {
    console.error("🔥 Error in getTaskById:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


export { createTask, getAllTasks,updateTask, getTaskById, taskValidation };