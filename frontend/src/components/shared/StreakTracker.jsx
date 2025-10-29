import React from 'react';
import { Flame, Calendar } from 'lucide-react';

const StreakTracker = ({ streak = 0 }) => {
  const getDaysOfWeek = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const currentDay = today.getDay();
    
    return days.map((day, index) => {
      const isToday = index === currentDay;
      const isPast = index < currentDay;
      const isActive = isPast || (isToday && streak > 0);
      
      return {
        day,
        isToday,
        isActive,
        isPast
      };
    });
  };

  const getStreakMessage = () => {
    if (streak === 0) {
      return "Start your streak today!";
    } else if (streak === 1) {
      return "Great start! Keep it going!";
    } else if (streak < 7) {
      return "You're on fire! 🔥";
    } else if (streak < 30) {
      return "Amazing streak! 🌟";
    } else {
      return "Legendary streak! 🏆";
    }
  };

  const daysData = getDaysOfWeek();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Learning Streak</h3>
        <div className="flex items-center text-orange-600">
          <Flame className="h-5 w-5 mr-1" />
          <span className="font-bold">{streak}</span>
        </div>
      </div>

      <div className="text-center mb-6">
        <div className="text-3xl font-bold text-gray-900 mb-1">{streak}</div>
        <div className="text-sm text-gray-600">Day{streak !== 1 ? 's' : ''} in a row</div>
        <div className="text-sm text-blue-600 font-medium mt-2">
          {getStreakMessage()}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center text-sm text-gray-600 mb-2">
          <Calendar className="h-4 w-4 mr-2" />
          <span>This week</span>
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {daysData.map((dayData, index) => (
            <div key={index} className="text-center">
              <div className="text-xs text-gray-500 mb-1">{dayData.day}</div>
              <div
                className={`h-8 w-8 mx-auto rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                  dayData.isActive
                    ? 'bg-orange-500 text-white'
                    : dayData.isToday
                    ? 'bg-gray-200 text-gray-600 border-2 border-orange-500'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {dayData.isToday ? (
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                ) : dayData.isActive ? (
                  '✓'
                ) : (
                  ''
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="text-center">
          <div className="text-xs text-gray-500 mb-2">Streak Goals</div>
          <div className="flex justify-center space-x-4">
            <div className={`text-center ${streak >= 7 ? 'text-green-600' : 'text-gray-400'}`}>
              <div className="text-sm font-medium">7 days</div>
              <div className="text-xs">Week Warrior</div>
            </div>
            <div className={`text-center ${streak >= 30 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className="text-sm font-medium">30 days</div>
              <div className="text-xs">Monthly Master</div>
            </div>
            <div className={`text-center ${streak >= 100 ? 'text-purple-600' : 'text-gray-400'}`}>
              <div className="text-sm font-medium">100 days</div>
              <div className="text-xs">Century Club</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreakTracker;