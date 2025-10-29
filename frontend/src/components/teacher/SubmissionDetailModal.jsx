import React from 'react';
import { X, User, Calendar, FileText, Download, Award,Clock,AlertTriangle,MessageSquare,Star,CheckCircle} from 'lucide-react';
import { useState } from 'react';

const SubmissionDetailModal = ({ submission, onClose, onGrade }) => {
  const [expanded, setExpanded] = useState(false);
  const previewLines = 10;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getStatusColor = (status, isLate) => {
    if (isLate && status === 'submitted') return 'text-red-600';
    switch (status) {
      case 'submitted': return 'text-yellow-600';
      case 'reviewed': return 'text-blue-600';
      case 'graded': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status, isLate) => {
    if (isLate && status === 'submitted') return <AlertTriangle className="h-5 w-5" />;
    switch (status) {
      case 'submitted': return <Clock className="h-5 w-5" />;
      case 'reviewed': return <MessageSquare className="h-5 w-5" />;
      case 'graded': return <CheckCircle className="h-5 w-5" />;
      default: return <Clock className="h-5 w-5" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Submission Details</h2>
            <p className="text-gray-600 mt-1">{submission.task.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Student and Task Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Student Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Student Information
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Name:</span>
                  <span className="ml-2">{submission.student.firstName} {submission.student.lastName}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Email:</span>
                  <span className="ml-2">{submission.student.email}</span>
                </div>
              </div>
            </div>

            {/* Submission Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Submission Information
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Submitted:</span>
                  <span className="ml-2">{formatDate(submission.submittedAt)}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium text-gray-700">Status:</span>
                  <div className={`ml-2 flex items-center ${getStatusColor(submission.status, submission.isLate)}`}>
                    {getStatusIcon(submission.status, submission.isLate)}
                    <span className="ml-1 capitalize">
                      {submission.isLate && submission.status === 'submitted' ? 'Late Submission' : submission.status}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Task Points:</span>
                  <span className="ml-2">{submission.task.points} points</span>
                </div>
                {submission.pointsEarned > 0 && (
                  <div>
                    <span className="font-medium text-gray-700">Points Earned:</span>
                    <span className="ml-2">{submission.pointsEarned} points</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Late Submission Warning */}
          {submission.isLate && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-red-800">Late Submission</h4>
                  <p className="text-sm text-red-700 mt-1">
                    This submission was received after the due date. Consider your late submission policy when grading.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Text Content */}
          {submission.textContent && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Text Submission</h3>
              <div className="max-h-[60vh] overflow-y-auto p-4 border bg-gray-50 rounded-lg">
                <p className="whitespace-pre-wrap">
                  {expanded ? submission.textContent : submission.textContent.split('\n').slice(0, previewLines).join('\n')}
                </p>
                <button onClick={() => setExpanded(!expanded)} className="text-blue-600 text-sm">
                  {expanded ? 'Show Less' : 'Show More'}
                </button>
              </div>
            </div>
          )}

          {/* Attachments */}
          {submission.attachments && submission.attachments.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Submitted Files</h3>
              <div className="space-y-3">
                {submission.attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 border rounded-lg">
                    <div className="flex items-center">
                      <FileText className="h-8 w-8 text-blue-600 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">{file.fileName}</p>
                        <p className="text-sm text-gray-500">
                          {file.fileType} • {formatFileSize(file.fileSize)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        // Handle file download
                        window.open(file.fileUrl, '_blank');
                      }}
                      className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Current Grade/Feedback */}
          {submission.grade && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Star className="h-5 w-5 mr-2 text-yellow-600" />
                Current Grade & Feedback
              </h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <Award className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-lg font-bold text-green-800">
                      Grade: {submission.grade.score}%
                    </span>
                  </div>
                  <div className="text-sm text-green-600">
                    Graded on {formatDate(submission.grade.gradedAt)}
                  </div>
                </div>
                {submission.grade.feedback && (
                  <div>
                    <h4 className="font-medium text-green-800 mb-2">Feedback:</h4>
                    <p className="text-green-700 whitespace-pre-wrap">
                      {submission.grade.feedback}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="btn-outline"
            >
              Close
            </button>
            <button
              onClick={onGrade}
              className="btn-primary"
            >
              {submission.grade ? 'Update Grade' : 'Grade Submission'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmissionDetailModal;