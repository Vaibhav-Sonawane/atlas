// const User = require('../models/User');
// const Submission = require('../models/Submission');
import User from "../models/User.js";
import Submission from "../models/Submission.js";

class StreakService {
  // Update user's streak after submission
  static async updateStreak(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      // Check if user submitted anything today
      const todaySubmission = await Submission.findOne({
        student: userId,
        status: 'submitted',
        submittedAt: {
          $gte: today,
          $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
      });

      if (!todaySubmission) {
        return user.gamification.currentStreak;
      }

      const lastActivity = user.gamification.lastActivityDate;
      let newStreak = user.gamification.currentStreak;

      if (!lastActivity) {
        // First activity ever
        newStreak = 1;
      } else {
        const lastActivityDate = new Date(lastActivity);
        lastActivityDate.setHours(0, 0, 0, 0);

        if (lastActivityDate.getTime() === yesterday.getTime()) {
          // Consecutive day - increment streak
          newStreak += 1;
        } else if (lastActivityDate.getTime() < yesterday.getTime()) {
          // Gap in activity - reset streak
          newStreak = 1;
        }
        // If lastActivityDate === today, streak remains same
      }

      // Update user's gamification data
      await User.findByIdAndUpdate(userId, {
        'gamification.currentStreak': newStreak,
        'gamification.longestStreak': Math.max(newStreak, user.gamification.longestStreak),
        'gamification.lastActivityDate': new Date()
      });

      // Award streak badges
      await this.checkStreakBadges(userId, newStreak);

      return newStreak;
    } catch (error) {
      throw new Error(`Failed to update streak: ${error.message}`);
    }
  }

  // Check and award streak-based badges
  static async checkStreakBadges(userId, currentStreak) {
    try {
      const user = await User.findById(userId);
      const badges = user.gamification.badges || [];
      const newBadges = [];

      // Define streak milestones
      const streakMilestones = [
        { streak: 7, badge: 'week-warrior' },
        { streak: 30, badge: 'month-master' },
        { streak: 100, badge: 'century-champion' },
        { streak: 365, badge: 'year-legend' }
      ];

      for (const milestone of streakMilestones) {
        if (currentStreak >= milestone.streak && !badges.includes(milestone.badge)) {
          newBadges.push(milestone.badge);
        }
      }

      if (newBadges.length > 0) {
        await User.findByIdAndUpdate(userId, {
          $addToSet: { 'gamification.badges': { $each: newBadges } }
        });
      }

      return newBadges;
    } catch (error) {
      console.error('Failed to check streak badges:', error);
    }
  }

  // Get streak statistics for all users
  static async getStreakStats() {
    try {
      const stats = await User.aggregate([
        {
          $match: {
            role: 'student',
            isActive: true
          }
        },
        {
          $group: {
            _id: null,
            averageStreak: { $avg: '$gamification.currentStreak' },
            maxStreak: { $max: '$gamification.longestStreak' },
            totalActiveUsers: { $sum: 1 },
            usersWithStreak: {
              $sum: {
                $cond: [{ $gt: ['$gamification.currentStreak', 0] }, 1, 0]
              }
            }
          }
        }
      ]);

      return stats[0] || {
        averageStreak: 0,
        maxStreak: 0,
        totalActiveUsers: 0,
        usersWithStreak: 0
      };
    } catch (error) {
      throw new Error(`Failed to get streak stats: ${error.message}`);
    }
  }
}

export default StreakService;