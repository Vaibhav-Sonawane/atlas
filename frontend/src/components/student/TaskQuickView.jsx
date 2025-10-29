import React from 'react';
import { Link } from 'react-router-dom';
import { 
  X, 
  Calendar, 
  Award, 
  Clock, 
  BookOpen,
  CheckCircle,
  AlertCircle,
  User
} from 'lucide-react';

const TaskQuickView = ({ task, isOpen, onClose }) => {
  if (!isOpen || !task) return null;

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'overdue':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date() && task.status !== 'completed';
  };

  const actualStatus = isOverdue(task.dueDate) ? 'overdue' : task.status;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div 
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-200">
          <div className="flex-1 pr-4">
            <div className="flex items-center space-x-3 mb-2">
              <h2 className="text-2xl font-bold text-gray-900">{task.title}</h2>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(task.difficulty)}`}>
                {task.difficulty}
              </span>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                {getStatusIcon(actualStatus)}
                <span className="ml-1 capitalize">{actualStatus}</span>
              </div>
              <span>•</span>
              <span>{task.category}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Description */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-700 leading-relaxed">{task.description}</p>
          </div>

          {/* Task Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600 mr-3" />
              <div>
                <p className="text-xs font-medium text-gray-600">Due Date</p>
                <p className="text-sm font-semibold text-gray-900">
                  {formatDate(task.dueDate)}
                </p>
                {isOverdue(task.dueDate) && (
                  <p className="text-xs text-red-600 font-medium">Overdue</p>
                )}
              </div>
            </div>

            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <Award className="h-5 w-5 text-yellow-600 mr-3" />
              <div>
                <p className="text-xs font-medium text-gray-600">Points</p>
                <p className="text-sm font-semibold text-gray-900">{task.points}</p>
              </div>
            </div>

            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <Clock className="h-5 w-5 text-green-600 mr-3" />
              <div>
                <p className="text-xs font-medium text-gray-600">Est. Time</p>
                <p className="text-sm font-semibold text-gray-900">{task.estimatedTime || '2-3 hours'}</p>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          {task.createdBy && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <User className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-sm text-blue-700">
                  <span className="font-medium">Created by:</span> {task.createdBy}
                </span>
              </div>
              {task.createdAt && (
                <p className="text-xs text-blue-600 mt-1">
                  Created on {formatDate(task.createdAt)}
                </p>
              )}
            </div>
          )}

          {/* Requirements Preview */}
          {task.requirements && task.requirements.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Key Requirements</h3>
              <ul className="space-y-1">
                {task.requirements.slice(0, 3).map((requirement, index) => (
                  <li key={index} className="flex items-start text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    {requirement}
                  </li>
                ))}
                {task.requirements.length > 3 && (
                  <li className="text-sm text-gray-500 italic">
                    +{task.requirements.length - 3} more requirements...
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Progress Indicator */}
          {task.status === 'completed' && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-green-800 font-medium">Task Completed</span>
              </div>
              <p className="text-green-700 text-sm mt-1">
                Great job! You've earned {task.points} points.
              </p>
            </div>
          )}

          {actualStatus === 'overdue' && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                <span className="text-red-800 font-medium">Task Overdue</span>
              </div>
              <p className="text-red-700 text-sm mt-1">
                This task was due on {formatDate(task.dueDate)}. Contact your instructor for guidance.
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="btn-outline"
          >
            Close
          </button>
          
          <div className="flex items-center space-x-3">
            <Link
              to={`/tasks/${task.id}`}
              className="btn-primary"
              onClick={onClose}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              {task.status === 'completed' ? 'View Details' : 'Start Task'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskQuickView;