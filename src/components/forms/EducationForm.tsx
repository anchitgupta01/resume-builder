import React, { useState } from 'react';
import { GraduationCap, Plus, Trash2 } from 'lucide-react';
import { Education } from '../../types/resume';

interface EducationFormProps {
  education: Education[];
  onChange: (education: Education[]) => void;
}

export function EducationForm({ education, onChange }: EducationFormProps) {
  const [newEducation, setNewEducation] = useState<Partial<Education>>({
    institution: '',
    degree: '',
    field: '',
    graduationDate: '',
    gpa: '',
    honors: ['']
  });

  const addEducation = () => {
    if (newEducation.institution && newEducation.degree && newEducation.field) {
      const edu: Education = {
        id: Date.now().toString(),
        institution: newEducation.institution,
        degree: newEducation.degree,
        field: newEducation.field,
        graduationDate: newEducation.graduationDate || '',
        gpa: newEducation.gpa || '',
        honors: newEducation.honors?.filter(h => h.trim()) || []
      };
      
      onChange([...education, edu]);
      setNewEducation({
        institution: '',
        degree: '',
        field: '',
        graduationDate: '',
        gpa: '',
        honors: ['']
      });
    }
  };

  const removeEducation = (id: string) => {
    onChange(education.filter(edu => edu.id !== id));
  };

  const addHonor = () => {
    setNewEducation(prev => ({
      ...prev,
      honors: [...(prev.honors || []), '']
    }));
  };

  const updateHonor = (index: number, value: string) => {
    setNewEducation(prev => ({
      ...prev,
      honors: (prev.honors || []).map((honor, i) => i === index ? value : honor)
    }));
  };

  const removeHonor = (index: number) => {
    setNewEducation(prev => ({
      ...prev,
      honors: (prev.honors || []).filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
      <div className="flex items-center space-x-3 mb-4 sm:mb-6">
        <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-lg">
          <GraduationCap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
        </div>
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Education</h3>
      </div>

      {/* Existing Education */}
      <div className="space-y-4 mb-6">
        {education.map((edu) => (
          <div key={edu.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 space-y-2 sm:space-y-0">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 dark:text-white">{edu.degree} in {edu.field}</h4>
                <p className="text-gray-600 dark:text-gray-400">{edu.institution}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Graduated: {edu.graduationDate}</p>
                {edu.gpa && <p className="text-sm text-gray-500 dark:text-gray-400">GPA: {edu.gpa}</p>}
              </div>
              <button
                onClick={() => removeEducation(edu.id)}
                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 self-start"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            
            {edu.honors && edu.honors.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Honors & Awards:</p>
                <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  {edu.honors.map((honor, index) => (
                    <li key={index}>{honor}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add New Education */}
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 sm:p-6">
        <h4 className="font-medium text-gray-900 dark:text-white mb-4">Add Education</h4>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Institution *
            </label>
            <input
              type="text"
              value={newEducation.institution || ''}
              onChange={(e) => setNewEducation(prev => ({ ...prev, institution: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="University Name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Degree *
            </label>
            <select
              value={newEducation.degree || ''}
              onChange={(e) => setNewEducation(prev => ({ ...prev, degree: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Select Degree</option>
              <option value="High School Diploma">High School Diploma</option>
              <option value="Associate's Degree">Associate's Degree</option>
              <option value="Bachelor's Degree">Bachelor's Degree</option>
              <option value="Master's Degree">Master's Degree</option>
              <option value="Doctoral Degree">Doctoral Degree</option>
              <option value="Certificate">Certificate</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Field of Study *
            </label>
            <input
              type="text"
              value={newEducation.field || ''}
              onChange={(e) => setNewEducation(prev => ({ ...prev, field: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Computer Science, Business, etc."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Graduation Date
            </label>
            <input
              type="month"
              value={newEducation.graduationDate || ''}
              onChange={(e) => setNewEducation(prev => ({ ...prev, graduationDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              GPA (Optional)
            </label>
            <input
              type="text"
              value={newEducation.gpa || ''}
              onChange={(e) => setNewEducation(prev => ({ ...prev, gpa: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="3.8/4.0"
            />
          </div>
        </div>

        {/* Honors */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Honors & Awards
          </label>
          {(newEducation.honors || []).map((honor, index) => (
            <div key={index} className="flex flex-col sm:flex-row gap-2 mb-2">
              <input
                type="text"
                value={honor}
                onChange={(e) => updateHonor(index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Dean's List, Magna Cum Laude, etc."
              />
              <button
                onClick={() => removeHonor(index)}
                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 px-2 py-2 sm:px-3"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            onClick={addHonor}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm flex items-center"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add honor/award
          </button>
        </div>

        <button
          onClick={addEducation}
          className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Education
        </button>
      </div>
    </div>
  );
}