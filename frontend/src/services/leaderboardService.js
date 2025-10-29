import apiClient from './apiClient';

export const leaderboardService = {
  // Student leaderboards
  getClassLeaderboard: async (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.period) params.append('period', filters.period); // weekly, monthly, all-time
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.category) params.append('category', filters.category);
    
    const response = await apiClient.get(`/student/leaderboard?${params.toString()}`);
    return response.data.data || response.data;
  },

  getMyRanking: async (period = 'all-time') => {
    const response = await apiClient.get(`/student/ranking?period=${period}`);
    return response.data.data || response.data;
  },

  // Global leaderboards (Admin)
  getGlobalLeaderboard: async (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.period) params.append('period', filters.period);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.role) params.append('role', filters.role);
    if (filters.institution) params.append('institution', filters.institution);
    
    const response = await apiClient.get(`/admin/global-leaderboard?${params.toString()}`);
    return response.data.data || response.data;
  },

  // Teacher leaderboards
  getClassLeaderboardByTeacher: async (classId, filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.period) params.append('period', filters.period);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    
    const response = await apiClient.get(`/teacher/classes/${classId}/leaderboard?${params.toString()}`);
    return response.data.data || response.data;
  },

  // Streak information
  getStreakData: async (userId = null) => {
    const endpoint = userId ? `/admin/users/${userId}/streak` : '/student/streak';
    const response = await apiClient.get(endpoint);
    return response.data.data || response.data;
  },

  // Achievement and badges
  getUserAchievements: async (userId = null) => {
    const endpoint = userId ? `/admin/users/${userId}/achievements` : '/student/achievements';
    const response = await apiClient.get(endpoint);
    return response.data.data || response.data;
  },

  getAvailableBadges: async () => {
    const response = await apiClient.get('/student/badges');
    return response.data.data || response.data;
  },

  // Statistics and analytics
  getLeaderboardStats: async () => {
    const response = await apiClient.get('/student/leaderboard/statistics');
    return response.data.data || response.data;
  },

  getUserProgress: async (userId = null, period = 'monthly') => {
    const endpoint = userId 
      ? `/admin/users/${userId}/progress?period=${period}`
      : `/student/progress?period=${period}`;
    const response = await apiClient.get(endpoint);
    return response.data.data || response.data;
  }
};