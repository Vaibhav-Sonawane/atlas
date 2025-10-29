import React, { useEffect, useState } from 'react';
import LeaderboardTable from '../shared/LeaderboardTable';
import { leaderboardService } from '../../services/leaderboardService';
import { useAuth } from '../../contexts/AuthContext';

const StudentLeaderboard = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await leaderboardService.getClassLeaderboard({ period: 'all-time' });
        setLeaderboard(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    <div className="p-6">
      <LeaderboardTable data={leaderboard} currentUserId={user?._id} />
    </div>
  );
};

export default StudentLeaderboard;
