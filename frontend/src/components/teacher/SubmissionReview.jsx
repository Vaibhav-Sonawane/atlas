import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Download, MessageSquare, Clock, CheckCircle, AlertCircle, FileText, User, Calendar, Award, Star } from 'lucide-react';
import { taskService } from '../../services/taskService';
import toast from 'react-hot-toast';
import SubmissionDetailModal from './SubmissionDetailModal';
import GradingModal from './GradingModal';
import { useLocation } from 'react-router-dom';

const SubmissionReview = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const taskId = queryParams.get('taskId');
  const [submissions, setSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [taskFilter, setTaskFilter] = useState('all');
  const [sortBy, setSortBy] = useState('submitted');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showGradingModal, setShowGradingModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    reviewed: 0,
    graded: 0
  });

  useEffect(() => {
    fetchSubmissions();
    fetchTasks();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [submissions, searchTerm, statusFilter, taskFilter, sortBy]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);

      const response = await taskService.getAllSubmissions();
      const fetchedSubmissions = response.submissions || response || [];

      // Calculate statistics
      const submissionStats = fetchedSubmissions.reduce((acc, sub) => {
        acc.total++;
        switch (sub.status) {
          case 'submitted':
            acc.pending++;
            break;
          case 'reviewed':
            acc.reviewed++;
            break;
          case 'graded':
            acc.graded++;
            break;
        }
        return acc;
      }, { total: 0, pending: 0, reviewed: 0, graded: 0 });

      setSubmissions(fetchedSubmissions);
      setStats(submissionStats);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await taskService.getTeacherTasks();
      setTasks(response.tasks || response || []);
    } catch (error) {
      console.error('Failed to load tasks', error);
      toast.error('Failed to load tasks');
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...submissions];

    // Apply search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(sub =>
        sub.student.firstName.toLowerCase().includes(search) ||
        sub.student.lastName.toLowerCase().includes(search) ||
        sub.student.email.toLowerCase().includes(search) ||
        sub.task.title.toLowerCase().includes(search) ||
        sub.textContent.toLowerCase().includes(search)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(sub => sub.status === statusFilter);
    }

    // Apply task filter
    if (taskFilter !== 'all') {
      filtered = filtered.filter(sub => sub.task._id === taskFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'submitted':
          return new Date(b.submittedAt) - new Date(a.submittedAt);
        case 'student':
          return `${a.student.firstName} ${a.student.lastName}`.localeCompare(`${b.student.firstName} ${b.student.lastName}`);
        case 'task':
          return a.task.title.localeCompare(b.task.title);
        case 'grade':
          const gradeA = a.grade?.score || 0;
          const gradeB = b.grade?.score || 0;
          return gradeB - gradeA;
        case 'status':
          const statusOrder = { submitted: 1, reviewed: 2, graded: 3 };
          return statusOrder[a.status] - statusOrder[b.status];
        default:
          return 0;
      }
    });

    setFilteredSubmissions(filtered);
  };

  const handleViewSubmission = (submission) => {
    setSelectedSubmission(submission);
    setShowDetailModal(true);
  };

  const handleGradeSubmission = (submission) => {
    setSelectedSubmission(submission);
    setShowGradingModal(true);
  };

  const handleGradeComplete = async (gradeData) => {
    if (!selectedSubmission) return;

    try {
      // Send grading data to backend
      const updatedSubmission = await taskService.gradeSubmission(selectedSubmission._id, gradeData);

      const refreshTasks = async () => {
        try {
          const response = await taskService.getTeacherTasks();
          setTasks(response.tasks || []);
        } catch (error) {
          console.error("Failed to refresh tasks:", error);
        }
      };

      // Update local state with backend response
      setSubmissions(prev => {
        const updated = prev.map(sub =>
          sub._id === selectedSubmission._id
            ? { ...sub, ...updatedSubmission }
            : sub
        );

        // Recalculate stats
        const updatedStats = updated.reduce((acc, sub) => {
          acc.total++;
          switch (sub.status) {
            case 'submitted':
              acc.pending++;
              break;
            case 'reviewed':
              acc.reviewed++;
              break;
            case 'graded':
              acc.graded++;
              break;
          }
          return acc;
        }, { total: 0, pending: 0, reviewed: 0, graded: 0 });

        setStats(updatedStats);

        return updated;
      });

      toast.success('Submission graded successfully!');
      setShowGradingModal(false);
      setSelectedSubmission(null);

    } catch (error) {
      console.error('Error grading submission:', error);
      toast.error('Failed to submit grade');
    }
  };


  const handleDownloadSubmission = async (submission) => {
    try {
      toast.loading('Preparing download...', { id: 'download' });

      // Call backend
      const blobData = await taskService.downloadSubmissionFiles(submission._id);

      // Generate a file name (could also zip multiple files on backend)
      const fileName = `${submission.student.firstName}_${submission.student.lastName}_${submission.task.title}.zip`;

      // Create a link and trigger download
      const url = window.URL.createObjectURL(new Blob([blobData]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Download started!', { id: 'download' });
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download submission', { id: 'download' });
    }
  };


  const getStatusBadge = (status, isLate = false) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";

    if (isLate && status === 'submitted') {
      return <span className={`${baseClasses} bg-red-100 text-red-800`}>Late Submission</span>;
    }

    switch (status) {
      case 'submitted':
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>Pending Review</span>;
      case 'reviewed':
        return <span className={`${baseClasses} bg-blue-100 text-blue-800`}>Reviewed</span>;
      case 'graded':
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>Graded</span>;
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>Unknown</span>;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-48 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg">
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-8 bg-gray-300 rounded"></div>
              </div>
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-6">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Submission Review</h1>
        <p className="text-gray-600 mt-2">Review and grade student submissions</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Submissions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Review</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MessageSquare className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Reviewed</p>
              <p className="text-2xl font-bold text-blue-600">{stats.reviewed}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Graded</p>
              <p className="text-2xl font-bold text-green-600">{stats.graded}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by student name, email, or task..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus-ring"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus-ring"
              >
                <option value="all">All Status</option>
                <option value="submitted">Pending Review</option>
                <option value="reviewed">Reviewed</option>
                <option value="graded">Graded</option>
              </select>
            </div>

            <select
              value={taskFilter}
              onChange={(e) => setTaskFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus-ring"
            >
              <option value="all">All Tasks</option>
              {tasks.map(task => (
                <option key={task._id} value={task._id}>{task.title}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus-ring"
            >
              <option value="submitted">Newest First</option>
              <option value="student">Student Name</option>
              <option value="task">Task Name</option>
              <option value="grade">Grade</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Showing {filteredSubmissions.length} of {submissions.length} submissions
          </p>
        </div>
      </div>

      {/* Submissions List */}
      <div className="space-y-4">
        {filteredSubmissions.length > 0 ? (
          filteredSubmissions.map((submission) => (
            <div key={submission._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {submission.task.title}
                    </h3>
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {submission.task.category}
                    </span>
                    {getStatusBadge(submission.status, submission.isLate)}
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      <span>{submission.student.firstName} {submission.student.lastName}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>Submitted {formatDate(submission.submittedAt)}</span>
                    </div>
                    <div className="flex items-center">
                      <Award className="h-4 w-4 mr-1" />
                      <span>{submission.task.points} pts</span>
                    </div>
                  </div>

                  {submission.textContent && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {submission.textContent}
                      </p>
                    </div>
                  )}

                  {submission.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {submission.attachments.map((file, index) => (
                        <div key={index} className="flex items-center text-xs bg-gray-100 rounded-full px-3 py-1">
                          <FileText className="h-3 w-3 mr-1" />
                          <span>{file.fileName}</span>
                          <span className="ml-1 text-gray-500">({formatFileSize(file.fileSize)})</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {submission.grade && (
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center text-green-600">
                        <Star className="h-4 w-4 mr-1" />
                        <span className="font-medium">Grade: {submission.grade.score}%</span>
                      </div>
                      {submission.grade.feedback && (
                        <div className="text-gray-600">
                          <MessageSquare className="h-4 w-4 inline mr-1" />
                          <span>Feedback provided</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleViewSubmission(submission)}
                    className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md"
                    title="View Details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>

                  {submission.attachments.length > 0 && (
                    <button
                      onClick={() => handleDownloadSubmission(submission)}
                      className="p-2 text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-md"
                      title="Download Files"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  )}

                  <button
                    onClick={() => handleGradeSubmission(submission)}
                    className="px-3 py-1 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    {submission.status === 'graded' ? 'Update Grade' : 'Grade'}
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions found</h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== 'all' || taskFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'No submissions to review at this time'}
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      {showDetailModal && selectedSubmission && (
        <SubmissionDetailModal
          submission={selectedSubmission}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedSubmission(null);
          }}
          onGrade={() => {
            setShowDetailModal(false);
            setShowGradingModal(true);
          }}
        />
      )}

      {showGradingModal && selectedSubmission && (
        <GradingModal
          submission={selectedSubmission}
          onSubmit={handleGradeComplete}
          onCancel={() => {
            setShowGradingModal(false);
            setSelectedSubmission(null);
          }}
        />
      )}
    </div>
  );
};

export default SubmissionReview;