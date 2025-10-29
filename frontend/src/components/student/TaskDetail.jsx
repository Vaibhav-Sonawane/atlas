import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft,Calendar,Clock,Award,CheckCircle,AlertCircle,BookOpen,FileText,Upload,Download } from 'lucide-react';
import SubmissionForm from './SubmissionForm';
import toast from 'react-hot-toast';
import axios from 'axios';
import { taskService } from '../../services/taskService';

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);

  useEffect(() => {
    const fetchTaskAndSubmission = async () => {
      try {
        const taskData = await taskService.getTaskById(id);
        setTask(taskData);

        // fetch existing submission if any
        const subData = await taskService.getStudentSubmissions(id); // <-- your existing method
        if (subData) setSubmission(subData);
      } catch (err) {
        toast.error('Failed to load task details');
      } finally {
        setLoading(false);
      }
    };
    fetchTaskAndSubmission();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!task) return <p>Task not found</p>;

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
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      case 'submitted':
        return <Clock className="h-6 w-6 text-blue-600" />;
      case 'overdue':
        return <AlertCircle className="h-6 w-6 text-red-600" />;
      default:
        return <BookOpen className="h-6 w-6 text-gray-600" />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date() && task.status !== 'completed';
  };

  const handleStartTask = () => {
    setShowSubmissionForm(true);
  };

  const handleSubmissionComplete = (newSubmission) => {
    setSubmission(newSubmission);
    setTask(prev => ({ ...prev, status: 'submitted' }));
    setShowSubmissionForm(false);
    toast.success('Task submitted successfully!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Task Not Found</h2>
        <p className="text-gray-600 mb-4">The task you're looking for doesn't exist or has been removed.</p>
        <button
          onClick={() => navigate('/tasks')}
          className="btn-primary"
        >
          Back to Tasks
        </button>
      </div>
    );
  }

  const actualStatus = isOverdue(task.dueDate) ? 'overdue' : task.status;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/tasks')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Tasks
        </button>
      </div>

      {/* Task Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              <h1 className="text-3xl font-bold text-gray-900">{task.title}</h1>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getDifficultyColor(task.difficulty)}`}>
                {task.difficulty}
              </span>
            </div>
            <p className="text-gray-600 text-lg mb-4">{task.description}</p>
            <div className="flex items-center text-sm text-gray-500 space-x-4">
              <span>
                By {task.createdBy?.firstName || task.createdBy || 'Unknown'} {task.createdBy?.lastName || ''}
              </span>
              <span>•</span>
              <span>{task.category}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                {getStatusIcon(actualStatus)}
              </div>
              <span className="text-sm font-medium text-gray-900 capitalize">
                {actualStatus}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Task Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-3">
            <Calendar className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="font-semibold text-gray-900">Due Date</h3>
          </div>
          <p className="text-gray-600">{formatDate(task.dueDate)}</p>
          {isOverdue(task.dueDate) && (
            <p className="text-red-600 text-sm mt-1 font-medium">Overdue</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-3">
            <Award className="h-5 w-5 text-yellow-600 mr-2" />
            <h3 className="font-semibold text-gray-900">Points</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{task.points}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-3">
            <Clock className="h-5 w-5 text-green-600 mr-2" />
            <h3 className="font-semibold text-gray-900">Estimated Time</h3>
          </div>
          <p className="text-gray-600">{task.estimatedTime}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
            <div className="prose prose-sm max-w-none">
              {(task.description || "").split('\n').map((paragraph, index) => (
                <p key={index} className="mb-3 text-gray-700 leading-relaxed">
                  {paragraph.trim()}
                </p>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Instructions</h2>
            <div className="prose prose-sm max-w-none">
              {(task.instructions || "").split('\n').map((line, index) => (
                <p key={index} className="mb-2 text-gray-700">
                  {line.trim()}
                </p>
              ))}
            </div>
          </div>

          {/* Submission Status */}
          {submission && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Submission</h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center mb-2">
                  <CheckCircle className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="font-medium text-blue-900">Submitted</span>
                </div>
                <p className="text-blue-700 text-sm">
                  Submitted on {formatDate(submission.submittedAt)}
                </p>
              </div>
              
              {submission.files && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Submitted Files:</h4>
                  <ul className="space-y-2">
                    <div>
                      <p>Submission Type: {task.requirements?.submissionType}</p>
                      <p>Max File Size: {task.requirements?.maxFileSize} MB</p>
                      <p>Allowed File Types: {task.requirements?.allowedFileTypes?.join(", ")}</p>
                    </div>
                  </ul>
                </div>
              )}

              {submission.grade && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-1">
                    Grade: {submission.grade.score}/100
                  </h4>
                  {submission.grade.feedback && (
                    <p className="text-green-700 text-sm">{submission.grade.feedback}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    Graded by {submission.grade.gradedBy} on {formatDate(submission.grade.gradedAt)}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Action Button */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {task.status !== 'completed' && (
              <button
                onClick={handleStartTask}
                disabled={isOverdue(task.dueDate)}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  isOverdue(task.dueDate)
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {submission ? 'Resubmit Task' : 'Start Task'}
              </button>
            )}
            
            {submission && task.status === 'submitted' && (
              <div className="text-center">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
                <p className="text-green-600 font-medium">Task Submitted</p>
                <p className="text-gray-600 text-sm mt-1">Waiting for review</p>
              </div>
            )}
            
            {task.status === 'completed' && (
              <div className="text-center">
                <Award className="h-12 w-12 text-yellow-600 mx-auto mb-2" />
                <p className="text-green-600 font-medium">Task Completed</p>
                <p className="text-gray-600 text-sm mt-1">+{task.points} points earned</p>
              </div>
            )}
          </div>

          {/* Requirements */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Requirements</h3>
            <ul className="space-y-2">
              <li className="mb-1 text-gray-700">
                <strong>Submission Type:</strong> {task.requirements?.submissionType || 'N/A'}
              </li>
              <li className="mb-1 text-gray-700">
                <strong>Max File Size:</strong> {task.requirements?.maxFileSize || 'N/A'} MB
              </li>
              <li className="mb-1 text-gray-700">
                <strong>Allowed File Types:</strong> {task.requirements?.allowedFileTypes?.length > 0 
                  ? task.requirements.allowedFileTypes.join(', ') 
                  : 'None'}
              </li>
            </ul>
          </div>


          {/* Resources */}
          {/* <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resources</h3>
            <ul className="space-y-3">
              {(task.resources || []).map((resource, index) => (
                <li key={index} className="mb-1 text-gray-700">
                  <a href={resource.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {resource.name}
                  </a>
                </li>
              ))}
            </ul>
          </div> */}

          
        </div>
      </div>

      {/* Submission Form Modal */}
      {showSubmissionForm && (
        <SubmissionForm
          task={task}
          existingSubmission={submission}
          onSubmit={handleSubmissionComplete}
          onCancel={() => setShowSubmissionForm(false)}
        />
      )}
    </div>
  );
};

export default TaskDetail;