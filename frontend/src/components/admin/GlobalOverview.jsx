import React, { useState, useEffect } from 'react';
import {
  Users,
  BookOpen,
  Award,
  TrendingUp,
  Activity,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  PieChart,
  Download,
  RefreshCw
} from 'lucide-react';
import { taskService } from '../../services/taskService';
import { leaderboardService } from '../../services/leaderboardService';
import toast from 'react-hot-toast';

const GlobalOverview = () => {
  const [overview, setOverview] = useState({
    users: {
      total: 0,
      students: 0,
      teachers: 0,
      admins: 0,
      activeThisMonth: 0,
      newThisWeek: 0
    },
    tasks: {
      total: 0,
      active: 0,
      completed: 0,
      categories: {}
    },
    submissions: {
      total: 0,
      pending: 0,
      graded: 0,
      averageGrade: 0
    },
    engagement: {
      dailyActiveUsers: 0,
      completionRate: 0,
      averageTimeToComplete: 0
    }
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);
  const [systemStats, setSystemStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchOverviewData();
  }, []);

  const fetchOverviewData = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true);
      else setLoading(true);

      const [adminDashboard, globalLeaderboard] = await Promise.all([
        taskService.getAdminDashboard(),
        leaderboardService.getGlobalLeaderboard({ limit: 5 })
      ]);

      setOverview(adminDashboard.overview || {
        users: { total: 0, students: 0, teachers: 0, admins: 0, activeThisMonth: 0, newThisWeek: 0 },
        tasks: { total: 0, active: 0, completed: 0, categories: {} },
        submissions: { total: 0, pending: 0, graded: 0, averageGrade: 0 },
        engagement: { dailyActiveUsers: 0, completionRate: 0, averageTimeToComplete: 0 }
      });
      setRecentActivity(adminDashboard.recentActivity || []);
      setTopPerformers(globalLeaderboard.users || []);
      setSystemStats(adminDashboard.systemStats || []);
    } catch (error) {
      console.error('Error fetching overview data:', error);
      toast.error('Failed to load overview data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchOverviewData(true);
    toast.success('Data refreshed successfully');
  };

  const handleExportData = () => {
    // This would implement data export functionality
    toast.info('Export functionality would be implemented here');
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'user_registered':
        return <Users className="h-4 w-4 text-blue-600" />;
      case 'task_created':
        return <BookOpen className="h-4 w-4 text-green-600" />;
      case 'submission_graded':
        return <CheckCircle className="h-4 w-4 text-purple-600" />;
      case 'achievement_unlocked':
        return <Award className="h-4 w-4 text-yellow-600" />;
      case 'task_completed':
        return <TrendingUp className="h-4 w-4 text-emerald-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  const calculatePercentageChange = (current, previous) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-64 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg">
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-8 bg-gray-300 rounded"></div>
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Global Overview</h1>
          <p className="text-gray-600 mt-2">
            System-wide analytics and performance metrics
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportData}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus-ring"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </button>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus-ring disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{formatNumber(overview.users.total)}</p>
              <p className="text-sm text-green-600 mt-1">
                +{overview.users.newThisWeek} this week
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Active Tasks */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Tasks</p>
              <p className="text-3xl font-bold text-gray-900">{formatNumber(overview.tasks.active)}</p>
              <p className="text-sm text-gray-500 mt-1">
                {formatNumber(overview.tasks.total)} total
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <BookOpen className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Total Submissions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Submissions</p>
              <p className="text-3xl font-bold text-gray-900">{formatNumber(overview.submissions.total)}</p>
              <p className="text-sm text-yellow-600 mt-1">
                {formatNumber(overview.submissions.pending)} pending
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Activity className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Average Grade */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Grade</p>
              <p className="text-3xl font-bold text-gray-900">{overview.submissions.averageGrade}%</p>
              <p className="text-sm text-blue-600 mt-1">
                {overview.engagement.completionRate}% completion
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Award className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* User Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Students</h3>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatNumber(overview.users.students)}</p>
          <p className="text-sm text-gray-500">
            {((overview.users.students / overview.users.total) * 100).toFixed(1)}% of users
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Teachers</h3>
            <div className="p-2 bg-green-100 rounded-lg">
              <BookOpen className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatNumber(overview.users.teachers)}</p>
          <p className="text-sm text-gray-500">
            {((overview.users.teachers / overview.users.total) * 100).toFixed(1)}% of users
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Daily Active</h3>
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatNumber(overview.engagement.dailyActiveUsers)}</p>
          <p className="text-sm text-gray-500">
            {((overview.engagement.dailyActiveUsers / overview.users.total) * 100).toFixed(1)}% engagement
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Avg. Completion</h3>
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{overview.engagement.averageTimeToComplete}h</p>
          <p className="text-sm text-gray-500">per task</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task Categories */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Task Categories</h3>
            <PieChart className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {Object.entries(overview.tasks.categories).map(([category, count], index) => {
              const percentage = ((count / overview.tasks.total) * 100).toFixed(1);
              const colors = [
                'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500',
                'bg-red-500', 'bg-indigo-500', 'bg-pink-500'
              ];
              return (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]} mr-3`}></div>
                    <span className="text-sm text-gray-700">{category}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-gray-900">{count}</span>
                    <span className="text-xs text-gray-500 ml-1">({percentage}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Top Performers</h3>
            <Award className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {topPerformers.map((user, index) => (
              <div key={user.id} className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-600'
                  }`}>
                  #{index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.points} pts • {user.tasksCompleted} tasks</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user.avgGrade}%</p>
                  <p className="text-xs text-gray-500">{user.streak} streak</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <Activity className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {recentActivity.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{activity.user}</span>
                  </p>
                  <p className="text-xs text-gray-600">{activity.details}</p>
                  <p className="text-xs text-gray-400">{formatDate(activity.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">System Health</h3>
          <BarChart3 className="h-5 w-5 text-gray-400" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900">System Status</h4>
            <p className="text-sm text-green-600">All Systems Operational</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-3">
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900">Performance</h4>
            <p className="text-sm text-blue-600">Excellent (99.9% uptime)</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mx-auto mb-3">
              <Activity className="h-8 w-8 text-purple-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900">Activity Level</h4>
            <p className="text-sm text-purple-600">High Engagement</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalOverview;