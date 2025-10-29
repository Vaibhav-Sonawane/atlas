import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Award, CheckCircle, AlertCircle } from 'lucide-react';

const TaskCard = ({ task }) => {
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'overdue':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-yellow-600 bg-yellow-50';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date() && task.status !== 'completed';
  };

  const actualStatus = isOverdue(task.dueDate) ? 'overdue' : task.status;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow overflow-hidden">
  <div className="flex justify-between mb-3">
    <div className="flex-1">
      {/* Title */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-gray-900">
          {task.title}
        </h3>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(task.difficulty)}`}>
          {task.difficulty}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 mb-3">
        {task.description}
      </p>
    </div>

    {/* Status Icon */}
    <div className={`ml-4 w-8 h-8 flex items-center justify-center rounded-full ${getStatusColor(actualStatus)}`}>
      {getStatusIcon(actualStatus)}
    </div>
  </div>

  {/* Info */}
  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-sm text-gray-500 mb-4 space-y-2 sm:space-y-0 sm:space-x-4">
    <div className="flex items-center space-x-4">
      <div className="flex items-center">
        <Calendar className="h-4 w-4 mr-1" />
        <span>Due {formatDate(task.dueDate)}</span>
      </div>
      <div className="flex items-center">
        <Award className="h-4 w-4 mr-1" />
        <span>{task.points} pts</span>
      </div>
    </div>
  </div>

  {/* Footer */}
  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(actualStatus)}`}>
      {actualStatus === 'overdue' ? 'Overdue' : actualStatus.charAt(0).toUpperCase() + actualStatus.slice(1)}
    </span>

    <Link
      to={`/tasks/${task.id}`}
      className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
    >
      {task.status === 'completed' ? 'View' : 'Start Task'}
    </Link>
  </div>
</div>
  );
};

export default TaskCard;