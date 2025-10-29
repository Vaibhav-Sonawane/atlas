// const mongoose = require('mongoose');
import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  instructions: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['MERN', 'HTML/CSS/JS', 'Python', 'Java', 'SQL', 'MongoDB', 'React.js', 'Express.js/Node.js', 'C', 'C++', 'Others']
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  points: {
    type: Number,
    required: true,
    min: 1,
    max: 100
  },
  dueDate: {
    type: Date,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileType: String
  }],
  requirements: {
    submissionType: {
      type: String,
      enum: ['text', 'file', 'both'],
      default: 'text'
    },
    maxFileSize: {
      type: Number,
      default: 10 // MB
    },
    allowedFileTypes: [String]
  }
}, {
  timestamps: true
});

taskSchema.index({ category: 1, difficulty: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ createdBy: 1 });

// module.exports = mongoose.model('Task', taskSchema);
export default mongoose.model('Task', taskSchema);