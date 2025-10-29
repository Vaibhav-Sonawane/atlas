import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import toast from 'react-hot-toast';

const TaskEditModal = ({ task, onSubmit, onCancel, students }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructions: '',
    category: 'MERN',
    difficulty: 'medium',
    points: 10,
    dueDate: '',
    dueTime: '23:59',
    assignedTo: [],
    requirements: {
      submissionType: 'both',
      maxFileSize: 10,
      allowedFileTypes: ['.pdf', '.doc', '.docx', '.txt', '.zip'],
    },
    isActive: true,
  });
  const [activeTab, setActiveTab] = useState('basic');
  const [loading, setLoading] = useState(false);
  const [hasSubmissions, setHasSubmissions] = useState(false);

  useEffect(() => {
    if (task) {
      const due = new Date(task.dueDate);
      setFormData({
        title: task.title || '',
        description: task.description || '',
        instructions: task.instructions || '',
        category: task.category || 'MERN',
        difficulty: task.difficulty || 'medium',
        points: task.points || 10,
        dueDate: due.toISOString().split('T')[0],
        dueTime: due.toTimeString().slice(0, 5),
        assignedTo: task.assignedTo?.map(s => ({ value: s._id || s, label: s.name || s })) || [],
        requirements: {
          submissionType: task.requirements?.submissionType || 'both',
          maxFileSize: task.requirements?.maxFileSize || 10,
          allowedFileTypes: task.requirements?.allowedFileTypes || ['.pdf', '.doc', '.docx', '.txt', '.zip'],
        },
        isActive: task.isActive !== undefined ? task.isActive : true,
      });
      setHasSubmissions(task.submissionCount > 0);
    }
  }, [task]);

  const handleInputChange = e => {
    const { name, value, type, checked } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: type === 'checkbox' ? checked : value },
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }
  };

  const handleFileTypesChange = e => {
    const fileTypes = e.target.value.split(',').map(f => f.trim()).filter(Boolean);
    setFormData(prev => ({ ...prev, requirements: { ...prev.requirements, allowedFileTypes: fileTypes } }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const dueDateTime = new Date(`${formData.dueDate}T${formData.dueTime}`);
      const payload = {
        ...formData,
        dueDate: dueDateTime.toISOString(),
        points: parseInt(formData.points),
        requirements: { ...formData.requirements, maxFileSize: parseInt(formData.requirements.maxFileSize) },
        assignedTo: formData.assignedTo.map(s => s.value),
      };
      delete payload.dueTime;
      await onSubmit(payload);
      // toast.success('Task updated successfully!');
    } catch (err) {
      console.error(err);
      // toast.error('Failed to update task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl w-full max-w-5xl p-6 max-h-[90vh] overflow-y-auto flex flex-col md:flex-row gap-6">
        
        {/* Left Section - Task Info */}
        <div className="flex-1 space-y-6">
          <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">Task Information</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input type="text" name="title" value={formData.title} onChange={handleInputChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea name="description" value={formData.description} onChange={handleInputChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 h-24 md:h-28 focus:ring-2 focus:ring-blue-500 outline-none resize-none"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
            <textarea name="instructions" value={formData.instructions} onChange={handleInputChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 h-24 md:h-28 focus:ring-2 focus:ring-blue-500 outline-none resize-none"/>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select name="category" value={formData.category} onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
                <option>MERN</option>
                <option>HTML/CSS/JS</option>
                <option>Python</option>
                <option>Java</option>
                <option>SQL</option>
                <option>MongoDB</option>
                <option>React.js</option>
                <option>Node.js/Express</option>
                <option>C</option>
                <option>C++</option>
                <option>Others</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
              <select name="difficulty" value={formData.difficulty} onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Points</label>
              <input type="number" name="points" min="1" max="100" value={formData.points} onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input type="date" name="dueDate" value={formData.dueDate} onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"/>
            </div>
          </div>
        </div>

        {/* Right Section - Assignment & Requirements */}
        <div className="flex-1 space-y-6">
          <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">Assignment & Requirements</h2>
          
          {/* Assign Students */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assign To Students</label>
            <Select isMulti options={students} value={formData.assignedTo} onChange={val => setFormData(prev => ({ ...prev, assignedTo: val }))} placeholder="Select students..." className="react-select-container" classNamePrefix="react-select"/>
          </div>

          {/* Submission Requirements */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Submission Type</label>
            <div className="flex gap-4">
              {['text', 'file', 'both'].map(type => (
                <label key={type} className="flex items-center gap-1">
                  <input type="radio" name="requirements.submissionType" value={type} checked={formData.requirements.submissionType === type} onChange={handleInputChange} />
                  {type === 'text' ? 'Text' : type === 'file' ? 'File' : 'Both'}
                </label>
              ))}
            </div>
          </div>
          {(formData.requirements.submissionType === 'file' || formData.requirements.submissionType === 'both') && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max File Size (MB)</label>
                <input type="number" name="requirements.maxFileSize" min="1" max="100" value={formData.requirements.maxFileSize} onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Allowed File Types</label>
                <input type="text" value={formData.requirements.allowedFileTypes.join(', ')} onChange={handleFileTypesChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"/>
              </div>
            </>
          )}

          {/* Active Toggle */}
          <div>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleInputChange} />
              Task is active
            </label>
          </div>

          {/* Actions */}
          <div className="flex flex-col md:flex-row justify-end gap-3 pt-4">
            <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg w-full md:w-auto">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg w-full md:w-auto">{loading ? 'Updating...' : 'Update Task'}</button>
          </div>
        </div>

      </form>
    </div>
  );
};

export default TaskEditModal;