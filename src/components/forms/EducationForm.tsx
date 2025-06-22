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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-purple-100 p-2 rounded-lg">
          <GraduationCap className="h-5 w-5 text-purple-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900">Education</h3>
      </div>

      {/* Existing Education */}
      <div className="space-y-4 mb-6">
        {education.map((edu) => (
          <div key={edu.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-semibold text-gray-900">{edu.degree} in {edu.field}</h4>
                <p className="text-gray-600">{edu.institution}</p>
                <p className="text-sm text-gray-500">Graduated: {edu.graduationDate}</p>
                {edu.gpa && <p className="text-sm text-gray-500">GPA: {edu.gpa}</p>}
              </div>
              <button
                onClick={() => removeEducation(edu.id)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            
            {edu.honors && edu.honors.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Honors & Awards:</p>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
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
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
        <h4 className="font-medium text-gray-900 mb-4">Add Education</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Institution *
            </label>
            <input
              type="text"
              value={newEducation.institution || ''}
              onChange={(e) => setNewEducation(prev => ({ ...prev, institution: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="University Name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Degree *
            </label>
            <select
              value={newEducation.degree || ''}
              onChange={(e) => setNewEducation(prev => ({ ...prev, degree: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Field of Study *
            </label>
            <input
              type="text"
              value={newEducation.field || ''}
              onChange={(e) => setNewEducation(prev => ({ ...prev, field: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Computer Science, Business, etc."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Graduation Date
            </label>
            <input
              type="month"
              value={newEducation.graduationDate || ''}
              onChange={(e) => setNewEducation(prev => ({ ...prev, graduationDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              GPA (Optional)
            </label>
            <input
              type="text"
              value={newEducation.gpa || ''}
              onChange={(e) => setNewEducation(prev => ({ ...prev, gpa: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="3.8/4.0"
            />
          </div>
        </div>

        {/* Honors */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Honors & Awards
          </label>
          {(newEducation.honors || []).map((honor, index) => (
            <div key={index} className="flex mb-2">
              <input
                type="text"
                value={honor}
                onChange={(e) => updateHonor(index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Dean's List, Magna Cum Laude, etc."
              />
              <button
                onClick={() => removeHonor(index)}
                className="ml-2 text-red-600 hover:text-red-800"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            onClick={addHonor}
            className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add honor/award
          </button>
        </div>

        <button
          onClick={addEducation}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Education
        </button>
      </div>
    </div>
  );
}