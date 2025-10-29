// const mongoose = require('mongoose');
import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema({
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  textContent: {
    type: String,
    default: ''
  },
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileType: String,
    fileSize: Number
  }],
  status: {
    type: String,
    enum: ['draft', 'submitted', 'reviewed', 'graded'],
    default: 'draft'
  },
  submittedAt: Date,
  grade: {
    score: {
      type: Number,
      min: 0,
      max: 100
    },
    feedback: String,
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    gradedAt: Date
  },
  isLate: {
    type: Boolean,
    default: false
  },
  pointsEarned: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

submissionSchema.pre('save', async function(next) {
  if (this.isModified('submittedAt') && this.submittedAt) {
    const task = await mongoose.model('Task').findById(this.task);
    if (task && this.submittedAt > task.dueDate) {
      this.isLate = true;
    }
  }
  next();
});

submissionSchema.index({ student: 1, task: 1 }, { unique: true });
submissionSchema.index({ status: 1 });

export default mongoose.model('Submission', submissionSchema);