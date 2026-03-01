import apiClient from './apiClient';

export const taskService = {
  // Student task operations
  getAllTasks: async (filters = {}) => {
    const params = new URLSearchParams();

    if (filters.search) params.append('search', filters.search);
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.difficulty && filters.difficulty !== 'all') params.append('difficulty', filters.difficulty);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.category) params.append('category', filters.category);

    const response = await apiClient.get(`/student/tasks?${params.toString()}`);
    return response.data.data || response.data;
  },

  // getTaskById: async (id) => {
  //   const response = await apiClient.get(`/tasks/${id}`);
  //   return response.data.data?.task || response.data.task || response.data;
  // },
  getTaskById: async (id) => {
    const response = await apiClient.get(`/tasks/${id}`);
    return response.data.data?.task || null; // always task object or null
  },

  getTaskStatistics: async () => {
    const response = await apiClient.get('/student/dashboard');
    return response.data.data || response.data;
  },

  // Student submissions - Updated for your Submission model
  submitTask: async (taskId, submissionData) => {
    const backendData = new FormData();

    if (submissionData.get('textContent')) {
      backendData.append('textContent', submissionData.get('textContent'));
    }

    if (submissionData.get('comments')) {
      backendData.append('comments', submissionData.get('comments'));
    }

    // Handle file attachments
    const files = [];
    for (let [key, value] of submissionData.entries()) {
      if (key.startsWith('files[') && value instanceof File) {
        files.push(value);
      }
    }

    files.forEach((file, index) => {
      backendData.append('attachments', file);
    });

    // Set status to submitted
    backendData.append('status', 'submitted');
    backendData.append('submittedAt', new Date().toISOString());

    const response = await apiClient.post(`student/submit/${taskId}`, backendData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    return response.data.data || response.data;
  },

  getSubmission: async (taskId) => {
    const response = await apiClient.get(`/student/submissions/task/${taskId}`);
    return response.data.data || response.data;
  },

  updateSubmission: async (taskId, submissionData) => {
    // Backend handles both create and update on POST /student/submit/:taskId
    const response = await apiClient.post(`/student/submit/${taskId}`, submissionData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data || response.data;
  },

  // Teacher task operations - Updated for your Task model
  createTask: async (taskData) => {
    // Map frontend task data to backend format
    const backendData = {
      title: taskData.title,
      description: taskData.description,
      instructions: taskData.instructions,
      category: taskData.category,
      difficulty: taskData.difficulty || 'medium',
      points: parseInt(taskData.points),
      dueDate: taskData.dueDate,
      assignedTo: taskData.assignedTo || [],
      requirements: {
        submissionType: taskData.submissionType || 'both',
        maxFileSize: taskData.maxFileSize || 10,
        allowedFileTypes: taskData.allowedFileTypes || ['.pdf', '.doc', '.docx', '.txt', '.zip']
      }
    };

    const response = await apiClient.post('/tasks', backendData);
    return response.data.data || response.data;
  },

  updateTask: async (id, taskData) => {
    const response = await apiClient.put(`/tasks/updatetask/${id}`, taskData);
    return response.data.data || response.data;
  },

  deleteTask: async (id) => {
    const response = await apiClient.delete(`/tasks/${id}`);
    return response.data.data || response.data;
  },

  getTeacherTasks: async (filters = {}) => {
    const params = new URLSearchParams();

    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);

    const response = await apiClient.get(`/teacher/tasks?${params.toString()}`);
    return response.data.data || response.data;
  },

  // Submission review (Teacher) - Updated for your Submission model
  getTaskSubmissions: async (taskId, filters = {}) => {
    const params = new URLSearchParams();

    if (filters.status) params.append('status', filters.status);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    params.append('taskId', taskId);

    const response = await apiClient.get(`/teacher/submissions?${params.toString()}`);
    return response.data.data || response.data;
  },

  //   getAllSubmissions: async (filters = {}) => {
  //   const params = new URLSearchParams();

  //   if (filters.status) params.append('status', filters.status);
  //   if (filters.taskId) params.append('taskId', filters.taskId);
  //   if (filters.studentId) params.append('studentId', filters.studentId); // optional
  //   if (filters.sortBy) params.append('sortBy', filters.sortBy);

  //   const response = await apiClient.get(`/student/submissions?${params.toString()}`);
  //   return response.data.data || response.data;
  // },

  // Student
  getStudentSubmissions: async (taskId) => {
    const response = await apiClient.get(`/student/submissions/task/${taskId}`);
    return response.data.data || response.data;
  },
  getAllStudentSubmissions: async () => {
    const response = await apiClient.get(`/student/submissions`);
    return response.data.data || response.data;
  },


  // Teacher/Admin
  getAllSubmissions: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.taskId) params.append('taskId', filters.taskId);
    if (filters.studentId) params.append('studentId', filters.studentId);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    const response = await apiClient.get(`/teacher/submissions?${params.toString()}`);
    return response.data.data || response.data;
  },

  gradeSubmission: async (submissionId, gradeData) => {
    const backendGradeData = {
      grade: {
        score: Number(gradeData.score),
        feedback: gradeData.feedback || ''
      }
    };

    const response = await apiClient.put(`/teacher/submissions/${submissionId}/grade`, backendGradeData);
    return response.data.data || response.data;
  },


  downloadSubmissionFiles: async (submissionId) => {
    const response = await apiClient.get(`/teacher/submissions/${submissionId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Categories and metadata - Updated for your Task categories
  getTaskCategories: async () => {
    // Return the categories from your Task model enum
    return [
      'MERN',
      'HTML/CSS/JS',
      'Python',
      'Java',
      'SQL',
      'MongoDB',
      'React.js',
      'Express.js/Node.js',
      'Other'
    ];
  },

  getTaskDifficulties: async () => {
    // Return the difficulties from your Task model enum
    return ['easy', 'medium', 'hard'];
  },

  // Dashboard data
  getStudentDashboard: async () => {
    const response = await apiClient.get('/student/dashboard');
    return response.data.data || response.data;
  },

  getTeacherDashboard: async () => {
    const response = await apiClient.get('/teacher/dashboard');
    return response.data.data || response.data;
  },

  getAdminDashboard: async () => {
    const response = await apiClient.get('/admin/stats');
    return response.data.data || response.data;
  },

  // Analytics
  getTaskAnalytics: async (taskId) => {
    const response = await apiClient.get(`/teacher/tasks/${taskId}/analytics`);
    return response.data.data || response.data;
  },

  getSubmissionAnalytics: async (filters = {}) => {
    const params = new URLSearchParams();

    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);
    if (filters.taskId) params.append('taskId', filters.taskId);

    const response = await apiClient.get(`/teacher/submissions/analytics?${params.toString()}`);
    return response.data.data || response.data;
  }
};