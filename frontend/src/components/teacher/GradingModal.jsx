import React, { useState, useEffect } from 'react';
import { X, Star, MessageSquare, Award, AlertTriangle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { taskService } from '../../services/taskService';

const GradingModal = ({ submission, onSubmit, onCancel }) => {
  const [gradeData, setGradeData] = useState({
    score: '',
    feedback: '',
    status: 'graded'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (submission.grade) {
      setGradeData({
        score: submission.grade.score.toString(),
        feedback: submission.grade.feedback || '',
        status: 'graded'
      });
    }
  }, [submission]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setGradeData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculatePointsEarned = (score) => {
    const numScore = parseInt(score);
    if (isNaN(numScore) || numScore < 0) return 0;
    return Math.round((numScore / 100) * submission.task.points);
  };

  const getGradeLetter = (score) => {
    const numScore = parseInt(score);
    if (isNaN(numScore)) return '';
    if (numScore >= 90) return 'A';
    if (numScore >= 80) return 'B';
    if (numScore >= 70) return 'C';
    if (numScore >= 60) return 'D';
    return 'F';
  };

  const getGradeColor = (score) => {
    const numScore = parseInt(score);
    if (isNaN(numScore)) return 'text-gray-600';
    if (numScore >= 90) return 'text-green-600';
    if (numScore >= 80) return 'text-blue-600';
    if (numScore >= 70) return 'text-yellow-600';
    if (numScore >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const validateForm = () => {
    const score = parseInt(gradeData.score);
    
    if (!gradeData.score.trim()) {
      toast.error('Please enter a grade score');
      return false;
    }
    
    if (isNaN(score) || score < 0 || score > 100) {
      toast.error('Grade must be between 0 and 100');
      return false;
    }
    
    if (!gradeData.feedback.trim()) {
      toast.error('Please provide feedback for the student');
      return false;
    }
    
    if (gradeData.feedback.trim().length < 10) {
      toast.error('Feedback must be at least 10 characters long');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // handleTaskGraded(taskId);

    if (!validateForm()) return;
  
    setLoading(true);
  
    try {
      const scoreNum = parseInt(gradeData.score); // convert string to number
      const payload = {
      score: scoreNum,
      feedback: gradeData.feedback.trim()
    };
    
      console.log('Submitting payload:', payload); // debug
    
      await onSubmit(payload);
      // toast.success('Grade submitted successfully!');

      await taskService.getTeacherTasks();

    } catch (err) {
      console.error('Error grading submission:', err);
      // toast.error('Failed to save grade');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAsReviewed = async () => {
    if (!gradeData.feedback.trim()) {
      toast.error('Please provide feedback before marking as reviewed');
      return;
    }

    setLoading(true);

    try {
      const reviewResult = {
        grade: {
          score: 0,
          feedback: gradeData.feedback.trim(),
          gradedBy: 'current-teacher-id',
          gradedAt: new Date().toISOString()
        },
        pointsEarned: 0,
        status: 'reviewed'
      };

      await onSubmit(reviewResult);
    } catch (error) {
      console.error('Review error:', error);
      toast.error('Failed to save review');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

return (
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-xl shadow-2xl w-full max-h-[70vh] md:max-h-[80vh] md:max-w-4xl overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            {submission.grade ? 'Update Grade' : 'Grade Submission'}
          </h2>
          <p className="text-gray-600 mt-1">
            {submission.student.firstName} {submission.student.lastName} • {submission.task.title}
          </p>
        </div>
        <button
          onClick={onCancel}
          className="p-2 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Submission Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg shadow-sm">
          <div><span className="font-medium text-gray-700">Task:</span> <span className="ml-2">{submission.task.title}</span></div>
          <div><span className="font-medium text-gray-700">Max Points:</span> <span className="ml-2">{submission.task.points}</span></div>
          <div><span className="font-medium text-gray-700">Submitted:</span> <span className="ml-2">{formatDate(submission.submittedAt)}</span></div>
          <div>
            <span className="font-medium text-gray-700">Status:</span>
            <span className={`ml-2 ${submission.isLate ? 'text-red-600' : 'text-green-600'}`}>
              {submission.isLate ? 'Late Submission' : 'On Time'}
            </span>
          </div>
        </div>

        {/* Late Warning */}
        {submission.isLate && (
          <div className="flex items-start bg-amber-50 border border-amber-200 rounded-lg p-4">
            <AlertTriangle className="h-5 w-5 text-amber-600 mr-3 mt-1" />
            <div>
              <h4 className="text-sm font-medium text-amber-800">Late Submission Notice</h4>
              <p className="text-sm text-amber-700 mt-1">This submission was received after the due date. Consider your late penalty policy when assigning the grade.</p>
            </div>
          </div>
        )}

        {/* Grade Input */}
        <div className="space-y-2">
          <label className="block font-medium text-gray-700">Grade (0-100) <span className="text-red-500">*</span></label>
          <div className="flex items-center gap-4">
            <input
              type="number"
              name="score"
              value={gradeData.score}
              onChange={handleInputChange}
              min="0"
              max="100"
              placeholder="Enter grade"
              className="flex-1 border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
            {gradeData.score && (
              <div className="flex flex-col text-right">
                <span className={`text-2xl font-bold ${getGradeColor(gradeData.score)}`}>{getGradeLetter(gradeData.score)}</span>
                <span className="text-sm text-gray-600">{calculatePointsEarned(gradeData.score)} / {submission.task.points} pts</span>
              </div>
            )}
          </div>
        </div>

        {/* Feedback */}
        <div className="space-y-2">
          <label className="block font-medium text-gray-700">Feedback <span className="text-red-500">*</span></label>
          <textarea
            name="feedback"
            value={gradeData.feedback}
            onChange={handleInputChange}
            rows={6}
            placeholder="Provide detailed feedback"
            className="w-full border rounded-lg p-3 resize-y focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          <div className="flex justify-between text-sm text-gray-500">
            <span>Be specific and constructive</span>
            <span>{gradeData.feedback.length} characters</span>
          </div>
        </div>

        {/* Quick Feedback */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Quick Feedback Templates</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {['Excellent Work', 'Good Effort', 'Needs Improvement', 'Needs Major Revision'].map((template, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setGradeData(prev => ({
                  ...prev,
                  feedback: prev.feedback + (prev.feedback ? '\n\n' : '') + template
                }))}
                className={`text-xs p-2 border rounded-lg hover:bg-opacity-30 transition ${
                  idx === 0 ? 'bg-green-50 border-green-200 text-green-800' :
                  idx === 1 ? 'bg-blue-50 border-blue-200 text-blue-800' :
                  idx === 2 ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
                  'bg-red-50 border-red-200 text-red-800'
                }`}
              >
                {template}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleSaveAsReviewed}
            disabled={loading}
            className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md disabled:opacity-50"
          >
            <MessageSquare className="h-4 w-4 mr-2" /> Save as Reviewed
          </button>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium border rounded-md hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Star className="h-4 w-4 mr-2" />
              {submission.grade ? 'Update Grade' : 'Submit Grade'}
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>

  );
};

export default GradingModal;