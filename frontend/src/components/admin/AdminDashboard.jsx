import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  BookOpen, 
  Award, 
  TrendingUp,
  School,
  UserCheck,
  ClipboardList,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import LeaderboardTable from '../shared/LeaderboardTable';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalTeachers: 0,
    totalTasks: 0,
    completedTasks: 0,
    totalSubmissions: 0
  });
  const [topPerformers, setTopPerformers] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Simulate API calls - replace with actual API calls
        setStats({
          totalUsers: 127,
          totalStudents: 95,
          totalTeachers: 12,
          totalTasks: 45,
          completedTasks: 1250,
          totalSubmissions: 3420
        });

        setTopPerformers([
          {
            id: 1,
            name: 'Alice Johnson',
            email: 'alice@example.com',
            role: 'student',
            points: 2840,
            tasksCompleted: 28,
            streak: 12
          },
          {
            id: 2,
            name: 'Bob Smith',
            email: 'bob@example.com',
            role: 'student',
            points: 2650,
            tasksCompleted: 25,
            streak: 8
          },
          {
            id: 3,
            name: 'Carol Davis',
            email: 'carol@example.com',
            role: 'student',
            points: 2480,
            tasksCompleted: 24,
            streak: 15
          }
        ]);

        setRecentActivity([
          {
            id: 1,
            type: 'task_completed',
            user: 'Alice Johnson',
            task: 'React Components',
            time: '2 hours ago'
          },
          {
            id: 2,
            type: 'user_registered',
            user: 'John Doe',
            role: 'student',
            time: '3 hours ago'
          },
          {
            id: 3,
            type: 'task_created',
            user: 'Dr. Smith',
            task: 'Advanced JavaScript',
            time: '5 hours ago'
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

  const getActivityIcon = (type) => {
    switch (type) {
      case 'task_completed':
        return <Award className="h-4 w-4 text-green-600" />;
      case 'user_registered':
        return <UserCheck className="h-4 w-4 text-blue-600" />;
      case 'task_created':
        return <BookOpen className="h-4 w-4 text-purple-600" />;
      default:
        return <ClipboardList className="h-4 w-4 text-gray-600" />;
    }
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
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-indigo-100 mb-4">Monitor system performance and user activity</p>
        <div className="flex items-center space-x-6">
          <div className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            <span>{stats.totalUsers} Total Users</span>
          </div>
          <div className="flex items-center">
            <BookOpen className="h-5 w-5 mr-2" />
            <span>{stats.totalTasks} Active Tasks</span>
          </div>
          <div className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            <span>{stats.totalSubmissions} Submissions</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <School className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Students</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <UserCheck className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Teachers</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTeachers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTasks}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <Award className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedTasks}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <ClipboardList className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Submissions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalSubmissions}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Performers */}
        <div className="lg:col-span-2">
          <LeaderboardTable 
            data={topPerformers} 
            title="Top Performers"
            showRankChange={true}
          />
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          </div>
          <div className="p-6">
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">{activity.user}</span>
                        {activity.type === 'task_completed' && ` completed ${activity.task}`}
                        {activity.type === 'user_registered' && ` registered as ${activity.role}`}
                        {activity.type === 'task_created' && ` created ${activity.task}`}
                      </p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/overview"
            className="flex items-center p-4 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <BarChart3 className="h-8 w-8 text-blue-600 mr-4" />
            <div>
              <h4 className="text-sm font-medium text-gray-900">System Overview</h4>
              <p className="text-sm text-gray-600">View detailed analytics</p>
            </div>
          </Link>
          
          <Link
            to="/manage-users"
            className="flex items-center p-4 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
          >
            <Users className="h-8 w-8 text-green-600 mr-4" />
            <div>
              <h4 className="text-sm font-medium text-gray-900">Manage Users</h4>
              <p className="text-sm text-gray-600">Add, edit, or remove users</p>
            </div>
          </Link>
          
          <Link
            to="/global-leaderboard"
            className="flex items-center p-4 text-left bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors"
          >
            <Award className="h-8 w-8 text-yellow-600 mr-4" />
            <div>
              <h4 className="text-sm font-medium text-gray-900">Global Leaderboard</h4>
              <p className="text-sm text-gray-600">View top performers</p>
            </div>
          </Link>
          
          <Link
            to="/manage-tasks"
            className="flex items-center p-4 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
          >
            <BookOpen className="h-8 w-8 text-purple-600 mr-4" />
            <div>
              <h4 className="text-sm font-medium text-gray-900">Manage Tasks</h4>
              <p className="text-sm text-gray-600">Oversee all assignments</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;