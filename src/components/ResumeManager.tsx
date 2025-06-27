import React, { useState } from 'react';
import { FileText, Plus, Edit3, Trash2, Calendar, Loader } from 'lucide-react';
import { useResumes } from '../hooks/useResumes';
import { Resume } from '../types/resume';

interface ResumeManagerProps {
  onSelectResume: (resume: Resume, resumeId?: string) => void;
  onCreateNew: () => void;
}

export function ResumeManager({ onSelectResume, onCreateNew }: ResumeManagerProps) {
  const { resumes, loading, error, deleteResume } = useResumes();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeletingId(id);
      await deleteResume(id);
    } catch (err) {
      alert('Failed to delete resume. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600 dark:text-gray-400">Loading your resumes...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <div className="text-center">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <h3 className="text-lg font-medium text-red-900 dark:text-red-100 mb-2">
              Error Loading Resumes
            </h3>
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          My Resumes
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your saved resumes and create new ones
        </p>
      </div>

      {/* Create New Resume Button */}
      <div className="mb-6">
        <button
          onClick={onCreateNew}
          className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <Plus className="h-5 w-5" />
          <span>Create New Resume</span>
        </button>
      </div>

      {/* Resumes Grid */}
      {resumes.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No resumes yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Create your first resume to get started
          </p>
          <button
            onClick={onCreateNew}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
          >
            <Plus className="h-5 w-5" />
            <span>Create Resume</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {resumes.map((resume) => (
            <div
              key={resume.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg flex-shrink-0">
                    <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                      {resume.name || 'Untitled Resume'}
                    </h3>
                    <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                      <Calendar className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">Updated {formatDate(resume.updated_at)}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(resume.id, resume.name || 'Untitled Resume')}
                  disabled={deletingId === resume.id}
                  className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-1 flex-shrink-0"
                  title="Delete resume"
                >
                  {deletingId === resume.id ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Resume Preview */}
              <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 truncate">
                  {resume.data.personalInfo.fullName || 'No name set'}
                </p>
                <div className="grid grid-cols-3 gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <div className="text-center">
                    <div className="font-medium">{resume.data.experience.length}</div>
                    <div>Jobs</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{resume.data.skills.length}</div>
                    <div>Skills</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{resume.data.projects.length}</div>
                    <div>Projects</div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <button
                onClick={() => onSelectResume(resume.data, resume.id)}
                className="w-full bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1"
              >
                <Edit3 className="h-4 w-4" />
                <span>Edit Resume</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}