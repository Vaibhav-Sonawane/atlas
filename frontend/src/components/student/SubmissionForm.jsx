import React, { useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { taskService } from '../../services/taskService.js';

const SubmissionForm = ({ task, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    textContent: '',
    attachments: [],
    comments: ''
  });
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Task requirements or defaults
  const maxFileSize = (task.requirements?.maxFileSize || 10) * 1024 * 1024; // bytes
  const allowedFileTypes = task.requirements?.allowedFileTypes || [
    '.zip', '.js', '.html', '.css', '.txt', '.md', '.pdf', '.doc', '.docx'
  ];
  const submissionType = task.requirements?.submissionType || 'both';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateFile = (file) => {
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    if (file.size > maxFileSize) {
      toast.error(`File ${file.name} is too large. Max ${task.requirements?.maxFileSize || 10}MB.`);
      return false;
    }
    if (!allowedFileTypes.includes(fileExtension)) {
      toast.error(`File type ${fileExtension} is not allowed. Allowed: ${allowedFileTypes.join(', ')}`);
      return false;
    }
    return true;
  };

  const handleFileSelect = (files) => {
    const validFiles = [];
    Array.from(files).forEach(file => {
      if (validateFile(file)) {
        const duplicate = formData.attachments.some(f => f.name === file.name && f.size === file.size);
        if (!duplicate) validFiles.push(file);
        else toast.error(`File ${file.name} is already selected.`);
      }
    });
    if (validFiles.length > 0) {
      setFormData(prev => ({ ...prev, attachments: [...prev.attachments, ...validFiles] }));
      toast.success(`${validFiles.length} file(s) added.`);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files) handleFileSelect(e.target.files);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files) handleFileSelect(e.dataTransfer.files);
  };

  const removeFile = (index) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
    toast.success('File removed.');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (submissionType === 'text' && !formData.textContent.trim()) {
      toast.error('Text submission is required.');
      return;
    }
    if (submissionType === 'file' && formData.attachments.length === 0) {
      toast.error('File submission is required.');
      return;
    }
    if (submissionType === 'both' && !formData.textContent.trim() && formData.attachments.length === 0) {
      toast.error('Provide text or upload files.');
      return;
    }
    if (formData.textContent.trim() && formData.textContent.trim().length < 50) {
      toast.error('Text submission must be at least 50 characters.');
      return;
    }

    setLoading(true);

    try {
      const submissionData = new FormData();
      
      if (formData.textContent.trim()) {
        submissionData.append('textContent', formData.textContent.trim());
      }
      if (formData.comments.trim()) {
        submissionData.append('comments', formData.comments.trim());
      }

      // Use 'attachments' as field name for multer
      formData.attachments.forEach((file) => {
        submissionData.append('attachments', file);
      });

      const response = await taskService.submitTask(task._id, submissionData);

      toast.success('Submission Done!');
      onSubmit(response); // Send backend response to parent
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Failed to submit. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Submit Task</h2>
          <button onClick={onCancel}>
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {submissionType !== 'file' && (
            <div>
              <label className="block mb-1 font-medium">Text Submission</label>
              <textarea
                name="textContent"
                value={formData.textContent}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md p-2"
                rows={5}
              />
            </div>
          )}

          {submissionType !== 'text' && (
            <div>
              <label className="block mb-1 font-medium">Attachments</label>
              <input type="file" multiple onChange={handleFileInputChange} />
              {formData.attachments.length > 0 && (
                <ul className="mt-2">
                  {formData.attachments.map((file, index) => (
                    <li key={index} className="flex justify-between items-center">
                      <span>{file.name}</span>
                      <button type="button" onClick={() => removeFile(index)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-2 mt-4">
            <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300 rounded-md">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmissionForm;