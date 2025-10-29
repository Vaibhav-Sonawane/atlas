import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  BookOpen, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Plus,
  Eye,
  Edit,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeTasks: 0,
    pendingReviews: 0,
    completionRate: 0
  });
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Simulate API calls - replace with actual API calls
        setStats({
          totalStudents: 45,
          activeTasks: 8,
          pendingReviews: 12,
          completionRate: 78.5
        });

        setRecentSubmissions([
          {
            id: 1,
            studentName: 'Alice Johnson',
            taskTitle: 'JavaScript Fundamentals',
            submittedAt: '2024-03-15T10:30:00Z',
            status: 'pending'
          },
          {
            id: 2,
            studentName: 'Bob Smith',
            taskTitle: 'React Components',
            submittedAt: '2024-03-15T09:15:00Z',
            status: 'reviewed'
          },
          {
            id: 3,
            studentName: 'Carol Davis',
            taskTitle: 'Database Design',
            submittedAt: '2024-03-14T16:45:00Z',
            status: 'pending'
          }
        ]);

        setRecentTasks([
          {
            id: 1,
            title: 'JavaScript Fundamentals',
            studentsEnrolled: 38,
            submissions: 25,
            dueDate: '2024-03-20'
          },
          {
            id: 2,
            title: 'React Components',
            studentsEnrolled: 42,
            submissions: 33,
            dueDate: '2024-03-18'
          }
        ]);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
        <p className="text-blue-100 mb-4">Manage your classes and track student progress</p>
        <div className="flex items-center space-x-6">
          <div className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            <span>{stats.totalStudents} Students</span>
          </div>
          <div className="flex items-center">
            <BookOpen className="h-5 w-5 mr-2" />
            <span>{stats.activeTasks} Active Tasks</span>
          </div>
          <div className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            <span>{stats.completionRate}% Completion Rate</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeTasks}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingReviews}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completionRate}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Submissions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Submissions</h2>
            <Link
              to="/submissions"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View all
            </Link>
          </div>
          <div className="p-6">
            {recentSubmissions.length > 0 ? (
              <div className="space-y-4">
                {recentSubmissions.map((submission) => (
                  <div key={submission.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">{submission.studentName}</h4>
                      <p className="text-sm text-gray-600">{submission.taskTitle}</p>
                      <p className="text-xs text-gray-500">{formatDate(submission.submittedAt)}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        submission.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {submission.status}
                      </span>
                      {submission.status === 'pending' && (
                        <button className="p-1 text-blue-600 hover:text-blue-700">
                          <Eye className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No recent submissions</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Your Tasks</h2>
            <Link
              to="/manage-tasks"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Manage all
            </Link>
          </div>
          <div className="p-6">
            {recentTasks.length > 0 ? (
              <div className="space-y-4">
                {recentTasks.map((task) => (
                  <div key={task.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-900">{task.title}</h4>
                      <button className="p-1 text-gray-600 hover:text-gray-700">
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Enrolled:</span> {task.studentsEnrolled}
                      </div>
                      <div>
                        <span className="font-medium">Submissions:</span> {task.submissions}
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${(task.submissions / task.studentsEnrolled) * 100}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No tasks created yet</p>
                <Link
                  to="/manage-tasks"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Task
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/manage-tasks"
            className="flex items-center p-4 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <Plus className="h-8 w-8 text-blue-600 mr-4" />
            <div>
              <h4 className="text-sm font-medium text-gray-900">Create New Task</h4>
              <p className="text-sm text-gray-600">Add a new assignment for students</p>
            </div>
          </Link>
          
          <Link
            to="/submissions"
            className="flex items-center p-4 text-left bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors"
          >
            <AlertCircle className="h-8 w-8 text-yellow-600 mr-4" />
            <div>
              <h4 className="text-sm font-medium text-gray-900">Review Submissions</h4>
              <p className="text-sm text-gray-600">{stats.pendingReviews} pending reviews</p>
            </div>
          </Link>
          
          <Link
            to="/students"
            className="flex items-center p-4 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
          >
            <Users className="h-8 w-8 text-green-600 mr-4" />
            <div>
              <h4 className="text-sm font-medium text-gray-900">View Students</h4>
              <p className="text-sm text-gray-600">Manage your {stats.totalStudents} students</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;