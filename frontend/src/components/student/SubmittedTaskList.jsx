import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { taskService } from '../../services/taskService';
import { BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';

const SubmittedTasksList = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const data = await taskService.getAllStudentSubmissions(); // GET /submissions
        setSubmissions(data);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load submissions');
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, []);

  if (loading) return <p>Loading submitted tasks...</p>;
  if (submissions.length === 0)
    return <p className="text-gray-500 text-center py-8">No submitted tasks yet</p>;

  return (
    <div className="space-y-4">
      {submissions.map((sub) => (
        <Link
          key={sub._id}
          to={`/tasks/${sub.task._id}`}
          className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <BookOpen className="h-5 w-5 text-blue-600" />
            <div>
              <p className="font-medium text-gray-900">{sub.task.title}</p>
              <p className="text-sm text-gray-500">
                Submitted on {new Date(sub.submittedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <span className="text-sm text-blue-600 font-medium">
            {sub.grade !== null ? `Graded: ${sub.grade}` : 'Pending'}
          </span>
        </Link>
      ))}
    </div>
  );
};

export default SubmittedTasksList;
