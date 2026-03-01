import express from "express";
import { createTask, getAllTasks, getTaskById, updateTask, deleteTask, taskValidation } from "../controllers/taskController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { checkRole } from "../middleware/roleCheck.js";
import User from "../models/User.js";

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all tasks (all authenticated users)
router.get('/', getAllTasks);

//get all students
router.get("/students", checkRole('teacher', 'admin'), async (req, res) => {
  try {
    // console.log("Fetching students...");
    const students = await User.find({ role: "student" });
    // console.log("Students found:", students.length);
    res.json(students);
  } catch (error) {
    // console.error("🔥 Error fetching students:", error); // log full error
    res.status(500).json({
      message: "Failed to fetch students",
      error: error.message, // send readable message
    });
  }
});

// Get task by ID (all authenticated users)
router.get('/:id', getTaskById);

// Create task (teachers and admins only)
router.post('/', checkRole('teacher', 'admin'), taskValidation, createTask);

// Update task (teachers and admins only)
router.put('/updatetask/:id', checkRole('teacher', 'admin'), taskValidation, updateTask);

// Delete task (teachers and admins only)
router.delete('/:id', checkRole('teacher', 'admin'), deleteTask);

export default router;