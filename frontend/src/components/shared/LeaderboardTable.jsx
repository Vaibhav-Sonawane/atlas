import React from 'react';
import { Trophy, Award, Medal, Crown, TrendingUp, TrendingDown } from 'lucide-react';

const LeaderboardTable = ({ 
  data = [], 
  currentUserId = null, 
  showRankChange = false,
  title = "Leaderboard"
}) => {
  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Trophy className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-orange-600" />;
      default:
        return <span className="text-sm font-semibold text-gray-600">#{rank}</span>;
    }
  };

  const getRankChangeIcon = (change) => {
    if (change > 0) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    } else if (change < 0) {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

  const getRankBadgeColor = (rank) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500';
      case 3:
        return 'bg-gradient-to-r from-orange-400 to-orange-600';
      default:
        return 'bg-gradient-to-r from-blue-500 to-blue-600';
    }
  };

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="text-center py-8">
          <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No leaderboard data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Trophy className="h-5 w-5 mr-2 text-yellow-600" />
          {title}
        </h3>
      </div>

      <div className="divide-y divide-gray-200">
        {data.map((user, index) => {
          const rank = index + 1;
          const isCurrentUser = currentUserId && user.id === currentUserId;
          
          return (
            <div
              key={user.id}
              className={`px-6 py-4 flex items-center space-x-4 hover:bg-gray-50 transition-colors ${
                isCurrentUser ? 'bg-blue-50 border-l-4 border-blue-500' : ''
              }`}
            >
              {/* Rank */}
              <div className="flex items-center justify-center w-12">
                {rank <= 3 ? (
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${getRankBadgeColor(rank)}`}>
                    {getRankIcon(rank)}
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    {getRankIcon(rank)}
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className={`text-sm font-medium truncate ${
                        isCurrentUser ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                        {user.name}
                        {isCurrentUser && (
                          <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                            You
                          </span>
                        )}
                      </p>
                      {showRankChange && user.rankChange !== 0 && (
                        <div className="flex items-center space-x-1">
                          {getRankChangeIcon(user.rankChange)}
                          <span className={`text-xs font-medium ${
                            user.rankChange > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {Math.abs(user.rankChange)}
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {user.role && user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      {user.institution && ` • ${user.institution}`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="text-right">
                <div className="flex items-center space-x-4">
                  <div>
                    <p className="text-lg font-bold text-gray-900">{user.points}</p>
                    <p className="text-xs text-gray-500">points</p>
                  </div>
                  {user.tasksCompleted !== undefined && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">{user.tasksCompleted}</p>
                      <p className="text-xs text-gray-500">tasks</p>
                    </div>
                  )}
                  {user.streak !== undefined && user.streak > 0 && (
                    <div className="flex items-center text-orange-600">
                      <Award className="h-4 w-4 mr-1" />
                      <span className="text-sm font-medium">{user.streak}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {data.length > 10 && (
        <div className="px-6 py-4 bg-gray-50 text-center">
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            View Full Leaderboard
          </button>
        </div>
      )}
    </div>
  );
};

export default LeaderboardTable;