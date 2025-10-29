import React, { useState, useEffect } from 'react';
import { Plus,Search,Filter,Edit,Trash2,Eye, Users, Calendar,Award,AlertCircle,CheckCircle,Clock,MoreVertical} from 'lucide-react';
import { taskService } from '../../services/taskService';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import TaskCreationModal from './TaskCreationModal';
import TaskEditModal from './TaskEditModal'; 
import { useNavigate } from 'react-router-dom';

const TaskManager = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  const categories = ['MERN','HTML/CSS/JS','Python','Java','SQL','MongoDB','React.js','Express.js/Node.js','C','C++','Other'];

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [tasks, searchTerm, statusFilter, categoryFilter, sortBy]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      
      let fetchedTasks = [];
      try {
        const response = await taskService.getTeacherTasks();
        fetchedTasks = response.tasks || response;
      } catch (error) {
        console.warn('API not available, using mock data');
        fetchedTasks = [
          {
            _id: '1',
            title: 'JavaScript Fundamentals',
            description: 'Complete the basic JavaScript exercises covering variables, functions, and control structures.',
            instructions: 'Download the starter code, complete all functions, run tests, and upload as ZIP.',
            category: 'HTML/CSS/JS',
            difficulty: 'easy',
            points: 100,
            dueDate: '2024-03-20T23:59:59Z',
            createdBy: user?._id || 'current-user',
            assignedTo: ['student1', 'student2', 'student3'],
            isActive: true,
            requirements: {
              submissionType: 'both',
              maxFileSize: 10,
              allowedFileTypes: ['.js', '.zip', '.txt']
            },
            createdAt: '2024-03-10T10:00:00Z',
            updatedAt: '2024-03-10T10:00:00Z',
            // Additional teacher view data
            submissionCount: 15,
            pendingReviews: 5,
            avgGrade: 85
          },
          {
            _id: '2',
            title: 'React Components Development',
            description: 'Build a todo list component with state management and event handling.',
            instructions: 'Create functional components, implement CRUD operations, style with CSS modules.',
            category: 'React.js',
            difficulty: 'medium',
            points: 150,
            dueDate: '2024-03-25T23:59:59Z',
            createdBy: user?._id || 'current-user',
            assignedTo: ['student1', 'student4', 'student5'],
            isActive: true,
            requirements: {
              submissionType: 'file',
              maxFileSize: 15,
              allowedFileTypes: ['.zip', '.js', '.jsx']
            },
            createdAt: '2024-03-12T10:00:00Z',
            updatedAt: '2024-03-12T10:00:00Z',
            submissionCount: 8,
            pendingReviews: 2,
            avgGrade: 78
          },
          {
            _id: '3',
            title: 'Database Schema Design',
            description: 'Design a relational database schema for an e-commerce application.',
            instructions: 'Create ERD diagram, write SQL DDL scripts, document relationships.',
            category: 'SQL',
            difficulty: 'hard',
            points: 200,
            dueDate: '2024-03-15T23:59:59Z',
            createdBy: user?._id || 'current-user',
            assignedTo: ['student2', 'student3'],
            isActive: false,
            requirements: {
              submissionType: 'both',
              maxFileSize: 20,
              allowedFileTypes: ['.sql', '.pdf', '.png']
            },
            createdAt: '2024-03-05T10:00:00Z',
            updatedAt: '2024-03-05T10:00:00Z',
            submissionCount: 12,
            pendingReviews: 0,
            avgGrade: 92
          }
        ];
      }

      setTasks(fetchedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskGraded = (taskId) => {
    setTasks(prev =>
      prev.map(task => {
        if (task._id === taskId) {
          return {
            ...task,
            pendingReviews: Math.max(task.pendingReviews - 1, 0),
            gradedCount: (task.gradedCount || 0) + 1
          };
        }
        return task;
      })
    );
  };

  const applyFiltersAndSort = () => {
    let filtered = [...tasks];

    // Apply search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(search) ||
        task.description.toLowerCase().includes(search) ||
        task.category.toLowerCase().includes(search)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(task => {
        switch (statusFilter) {
          case 'active':
            return task.isActive && new Date(task.dueDate) >= now;
          case 'inactive':
            return !task.isActive;
          case 'overdue':
            return task.isActive && new Date(task.dueDate) < now;
          case 'pending-reviews':
            return task.pendingReviews > 0;
          default:
            return true;
        }
      });
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(task => task.category === categoryFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'dueDate':
          return new Date(a.dueDate) - new Date(b.dueDate);
        case 'created':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'points':
          return b.points - a.points;
        case 'submissions':
          return b.submissionCount - a.submissionCount;
        default:
          return 0;
      }
    });

    console.log('SearchTerm:', searchTerm);
    console.log('Tasks:', tasks);
    console.log('Filtered before set:', filtered);
    setFilteredTasks(filtered);
  };

  const handleCreateTask = async (taskData) => {
    try {
      await taskService.createTask(taskData);
      toast.success('Task created successfully!');
      setShowCreateModal(false);
      fetchTasks();
    } catch (error) {
      toast.error('Failed to create task');
    }
  };

  const handleEditTask = async (taskData) => {
    try {
      const updatedTask = await taskService.updateTask(selectedTask._id, taskData);
      toast.success('Task updated successfully!');

      setTasks(prevTasks =>
        prevTasks.map(task =>
          task._id === selectedTask._id
            ? { ...task, ...updatedTask }
            : task
        )
      );
      setShowEditModal(false);
      setSelectedTask(null);
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      await taskService.deleteTask(taskId);
      toast.success('Task deleted successfully!');
      fetchTasks();
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const handleToggleTaskStatus = async (task) => {
    try {
      await taskService.updateTask(task._id, { isActive: !task.isActive });
      toast.success(`Task ${!task.isActive ? 'activated' : 'deactivated'} successfully!`);
      fetchTasks();
    } catch (error) {
      toast.error('Failed to update task status');
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedTasks.length} tasks?`)) return;

    try {
      // Implement bulk delete
      for (const taskId of selectedTasks) {
        await taskService.deleteTask(taskId);
      }
      toast.success(`${selectedTasks.length} tasks deleted successfully!`);
      setSelectedTasks([]);
      setShowBulkActions(false);
      fetchTasks();
    } catch (error) {
      toast.error('Failed to delete tasks');
    }
  };

  const handleSelectTask = (taskId) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleSelectAll = () => {
    setSelectedTasks(
      selectedTasks.length === filteredTasks.length 
        ? [] 
        : filteredTasks.map(task => task._id)
    );
  };

  const getStatusBadge = (task) => {
    const now = new Date();
    const dueDate = new Date(task.dueDate);
    
    if (!task.isActive) {
      return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">Inactive</span>;
    }
    
    if (dueDate < now) {
      return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Overdue</span>;
    }
    
    return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Active</span>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-48 mb-4"></div>
          <div className="bg-white rounded-lg p-6 mb-6">
            <div className="h-10 bg-gray-300 rounded mb-4"></div>
          </div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-6">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-full"></div>
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
          <h1 className="text-3xl font-bold text-gray-900">Task Management</h1>
          <p className="text-gray-600 mt-2">Create, edit, and manage your assignments</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary"><div className="btn-primary flex items-center justify-center gap-1"><Plus className="h-5 w-5 mr-2" />Create Task</div></button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Submissions</p>
              <p className="text-2xl font-bold text-gray-900">
                {tasks.reduce((sum, task) => sum + task.submissionCount, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
              <p className="text-2xl font-bold text-gray-900">
                {tasks.reduce((sum, task) => sum + task.pendingReviews, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Award className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Graded Submissions</p>
              <p className="text-2xl font-bold text-gray-900">
                {tasks.reduce((sum, task) => sum + (task.gradedCount || 0), 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus-ring"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus-ring"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="overdue">Overdue</option>
                <option value="pending-reviews">Pending Reviews</option>
              </select>
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus-ring"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus-ring"
            >
              <option value="created">Newest First</option>
              <option value="title">Title</option>
              <option value="dueDate">Due Date</option>
              <option value="points">Points</option>
              <option value="submissions">Submissions</option>
            </select>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {filteredTasks.length} of {tasks.length} tasks
          </p>
          
          {selectedTasks.length > 0 && (
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">
                {selectedTasks.length} selected
              </span>
              <button
                onClick={handleBulkDelete}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Delete Selected
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tasks Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {filteredTasks.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedTasks.length === filteredTasks.length && filteredTasks.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Task
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submissions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTasks.map((task) => (
                  <tr key={task._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedTasks.includes(task._id)}
                        onChange={() => handleSelectTask(task._id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{task.title}</div>
                          <div className="text-sm text-gray-500 line-clamp-2">{task.description}</div>
                          <div className="flex items-center mt-1 space-x-2 text-xs text-gray-500">
                            <Award className="h-3 w-3" />
                            <span>{task.points} points</span>
                            <span>•</span>
                            <span className="capitalize">{task.difficulty}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {task.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{formatDate(task.dueDate)}</div>
                      {new Date(task.dueDate) < new Date() && task.isActive && (
                        <div className="text-xs text-red-600 font-medium">Overdue</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(task)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {task.submissionCount ?? 0} submissions
                      </div>
                      {task.pendingReviews > 0 && (
                        <div className="text-xs text-yellow-600">
                          {task.pendingReviews} pending review
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => navigate(`/submissions?taskId=${task._id}`)}
                          className="text-blue-600 hover:text-blue-700"
                          title="View Submissions"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedTask(task);
                            setShowEditModal(true);
                          }}
                          className="text-gray-600 hover:text-gray-700"
                          title="Edit Task"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task._id)}
                          className="text-red-600 hover:text-red-700"
                          title="Delete Task"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Get started by creating your first task'}
            </p>
            <button onClick={() => setShowCreateModal(true)} className="btn-primary"><div className="btn-primary flex items-center justify-center gap-1"><Plus className="h-5 w-5 mr-2" />Create Task</div></button>
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <TaskCreationModal
          onSubmit={handleCreateTask}
          onCancel={() => setShowCreateModal(false)}
          categories={categories}
        />
      )}

      {showEditModal && selectedTask && (
        <TaskEditModal
          task={selectedTask}
          onSubmit={(updatedData) => {
            handleEditTask(updatedData); 
            handleTaskGraded(selectedTask._id); // update counts locally
          }}
          onCancel={() => {
            setShowEditModal(false);
            setSelectedTask(null);
          }}
          categories={categories}
        />
      )}
    </div>
  );
};

export default TaskManager;