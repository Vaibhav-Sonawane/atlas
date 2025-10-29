import React, { useState, useEffect } from 'react';
import { Search, Filter, SortAsc, Calendar, Award, RefreshCw } from 'lucide-react';
import TaskCard from '../shared/TaskCard';
import { taskService } from '../../services/taskService';
import toast from 'react-hot-toast';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0
  });

  useEffect(() => {
    fetchTasks();
    fetchCategories();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [tasks, searchTerm, statusFilter, difficultyFilter, categoryFilter, sortBy]);

  const fetchTasks = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true);
      else setLoading(true);

      let fetchedTasks = [];
      try {
        const response = await taskService.getAllTasks();
        fetchedTasks = response.tasks || response;
      } catch (error) {
        console.warn('API not available, using mock data');
        fetchedTasks = [/* ... your mock tasks list ... */];
      }

      // Calculate stats
      const now = new Date();
      const taskStats = fetchedTasks.reduce((acc, task) => {
        acc.total++;
        const isCompleted = false; // placeholder
        const isOverdue = new Date(task.dueDate) < now && !isCompleted;
        if (isCompleted) acc.completed++;
        else if (isOverdue) acc.overdue++;
        else acc.pending++;
        return acc;
      }, { total: 0, completed: 0, pending: 0, overdue: 0 });

      setTasks(fetchedTasks);
      setStats(taskStats);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const categories = await taskService.getTaskCategories();
      setCategories(categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories(['MERN','HTML/CSS/JS','Python','Java','SQL','MongoDB','React.js','Express.js/Node.js','Other']);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...tasks];

    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(search) ||
        task.description.toLowerCase().includes(search) ||
        task.category.toLowerCase().includes(search) ||
        task.instructions?.toLowerCase().includes(search)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => {
        if (statusFilter === 'overdue') return new Date(task.dueDate) < new Date();
        if (statusFilter === 'completed') return false;
        if (statusFilter === 'pending') return new Date(task.dueDate) >= new Date();
        return true;
      });
    }

    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(task => task.difficulty === difficultyFilter);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(task => task.category === categoryFilter);
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'dueDate': return new Date(a.dueDate) - new Date(b.dueDate);
        case 'title': return a.title.localeCompare(b.title);
        case 'points': return b.points - a.points;
        case 'difficulty':
          const order = { easy: 1, medium: 2, hard: 3 };
          return order[a.difficulty] - order[b.difficulty];
        case 'category': return a.category.localeCompare(b.category);
        case 'created': return new Date(b.createdAt) - new Date(a.createdAt);
        default: return 0;
      }
    });

    setFilteredTasks(filtered.map(task => ({
      id: task._id,
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      points: task.points,
      difficulty: task.difficulty,
      category: task.category,
      status: 'pending',
      estimatedTime: getEstimatedTime(task.difficulty, task.points),
      createdBy: task.createdBy,
      createdAt: task.createdAt
    })));
  };

  const getEstimatedTime = (difficulty, points) => {
    if (difficulty === 'easy') return '1-2 hours';
    if (difficulty === 'medium') return '2-4 hours';
    if (difficulty === 'hard') return '4-6 hours';
    return '2-3 hours';
  };

  const handleRefresh = () => fetchTasks(true);
  const clearAllFilters = () => { setSearchTerm(''); setStatusFilter('all'); setDifficultyFilter('all'); setCategoryFilter('all'); setSortBy('dueDate'); };
  const getActiveFilterCount = () => ['searchTerm','statusFilter','difficultyFilter','categoryFilter'].filter(f => eval(f) !== 'all' && eval(f)).length;

  if (loading) return (<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>);

  return (
    <div className="space-y-6">
      <div className="space-y-6">
    {/* header, stats, filters ... */}

    {filteredTasks.length === 0 ? (<p className="text-gray-500 text-center">No tasks found</p>)
    :(<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
        )}
      </div>
    </div>
  );
};

export default TaskList;