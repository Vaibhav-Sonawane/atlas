import User from "../models/User.js";
import Submission from "../models/Submission.js";

class LeaderboardService {
  static async getGlobalLeaderboard(limit = 50) {
    try {
      const users = await User.find({ 
        role: 'student',
        isActive: true,
        'gamification.totalPoints': { $gt: 0 }
      })
      .select('firstName lastName email gamification')
      .sort({ 'gamification.totalPoints': -1 })
      .limit(limit);

      return users.map((user, index) => ({
        rank: index + 1,
        id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        points: user.gamification.totalPoints,
        level: user.gamification.level,
        currentStreak: user.gamification.currentStreak,
        badges: user.gamification.badges
      }));
    } catch (error) {
      throw new Error(`Failed to get global leaderboard: ${error.message}`);
    }
  }

  // Time-based global leaderboard (weekly, monthly, all-time)
  static async getTimeBasedLeaderboard(period = 'all-time', limit = 50) {
    try {
      let sortField;
      switch (period) {
        case 'weekly': sortField = 'gamification.weeklyPoints'; break;
        case 'monthly': sortField = 'gamification.monthlyPoints'; break;
        case 'all-time':
        default: sortField = 'gamification.totalPoints';
      }

      const users = await User.find({ 
        role: 'student',
        isActive: true,
        [sortField]: { $gt: 0 }
      })
      .select('firstName lastName email gamification')
      .sort({ [sortField]: -1 })
      .limit(limit);

      return users.map((user, index) => ({
        rank: index + 1,
        id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        points: user.gamification[sortField.replace('gamification.', '')],
        level: user.gamification.level,
        currentStreak: user.gamification.currentStreak,
        badges: user.gamification.badges
      }));
    } catch (error) {
      throw new Error(`Failed to get ${period} leaderboard: ${error.message}`);
    }
  }

  // User rank in global leaderboard (all-time, weekly, monthly)
  static async getUserRank(userId, period = 'all-time') {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');

      let pointsField;
      switch (period) {
        case 'weekly': pointsField = 'gamification.weeklyPoints'; break;
        case 'monthly': pointsField = 'gamification.monthlyPoints'; break;
        case 'all-time':
        default: pointsField = 'gamification.totalPoints';
      }

      const usersAbove = await User.countDocuments({
        role: 'student',
        isActive: true,
        [pointsField]: { $gt: user.gamification[pointsField.replace('gamification.', '')] }
      });

      return usersAbove + 1;
    } catch (error) {
      throw new Error(`Failed to get user rank: ${error.message}`);
    }
  }

  // Category-specific leaderboard
  static async getCategoryLeaderboard(category, limit = 50) {
    try {
      const categoryPoints = await Submission.aggregate([
        { $lookup: { from: 'tasks', localField: 'task', foreignField: '_id', as: 'taskInfo' } },
        { $unwind: '$taskInfo' },
        { $match: { 'taskInfo.category': category, status: 'graded', pointsEarned: { $gt: 0 } } },
        { $group: { _id: '$student', totalCategoryPoints: { $sum: '$pointsEarned' }, submissionsCount: { $sum: 1 } } },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
        { $unwind: '$user' },
        { $match: { 'user.role': 'student', 'user.isActive': true } },
        { $sort: { totalCategoryPoints: -1 } },
        { $limit: limit }
      ]);

      return categoryPoints.map((item, index) => ({
        rank: index + 1,
        id: item.user._id,
        name: `${item.user.firstName} ${item.user.lastName}`,
        email: item.user.email,
        categoryPoints: item.totalCategoryPoints,
        submissionsCount: item.submissionsCount
      }));
    } catch (error) {
      throw new Error(`Failed to get category leaderboard: ${error.message}`);
    }
  }
}

export default LeaderboardService;