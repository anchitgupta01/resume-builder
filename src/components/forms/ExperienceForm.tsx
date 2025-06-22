import React, { useState } from 'react';
import { Briefcase, Plus, Trash2, Edit3 } from 'lucide-react';
import { Experience } from '../../types/resume';

interface ExperienceFormProps {
  experience: Experience[];
  onChange: (experience: Experience[]) => void;
}

export function ExperienceForm({ experience, onChange }: ExperienceFormProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newExperience, setNewExperience] = useState<Partial<Experience>>({
    company: '',
    position: '',
    startDate: '',
    endDate: '',
    current: false,
    description: [''],
    achievements: ['']
  });

  const addExperience = () => {
    if (newExperience.company && newExperience.position) {
      const exp: Experience = {
        id: Date.now().toString(),
        company: newExperience.company,
        position: newExperience.position,
        startDate: newExperience.startDate || '',
        endDate: newExperience.current ? '' : newExperience.endDate || '',
        current: newExperience.current || false,
        description: newExperience.description?.filter(d => d.trim()) || [],
        achievements: newExperience.achievements?.filter(a => a.trim()) || []
      };
      
      onChange([...experience, exp]);
      setNewExperience({
        company: '',
        position: '',
        startDate: '',
        endDate: '',
        current: false,
        description: [''],
        achievements: ['']
      });
    }
  };

  const removeExperience = (id: string) => {
    onChange(experience.filter(exp => exp.id !== id));
  };

  const updateExperience = (id: string, updates: Partial<Experience>) => {
    onChange(experience.map(exp => exp.id === id ? { ...exp, ...updates } : exp));
  };

  const addDescriptionItem = (type: 'description' | 'achievements') => {
    setNewExperience(prev => ({
      ...prev,
      [type]: [...(prev[type] || []), '']
    }));
  };

  const updateDescriptionItem = (type: 'description' | 'achievements', index: number, value: string) => {
    setNewExperience(prev => ({
      ...prev,
      [type]: (prev[type] || []).map((item, i) => i === index ? value : item)
    }));
  };

  const removeDescriptionItem = (type: 'description' | 'achievements', index: number) => {
    setNewExperience(prev => ({
      ...prev,
      [type]: (prev[type] || []).filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-green-100 p-2 rounded-lg">
          <Briefcase className="h-5 w-5 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900">Work Experience</h3>
      </div>

      {/* Existing Experience */}
      <div className="space-y-4 mb-6">
        {experience.map((exp) => (
          <div key={exp.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-semibold text-gray-900">{exp.position}</h4>
                <p className="text-gray-600">{exp.company}</p>
                <p className="text-sm text-gray-500">
                  {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setEditingId(editingId === exp.id ? null : exp.id)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => removeExperience(exp.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            {exp.description.length > 0 && (
              <div className="mb-2">
                <p className="text-sm font-medium text-gray-700 mb-1">Responsibilities:</p>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  {exp.description.map((desc, index) => (
                    <li key={index}>{desc}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {exp.achievements.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Achievements:</p>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  {exp.achievements.map((achievement, index) => (
                    <li key={index}>{achievement}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add New Experience */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
        <h4 className="font-medium text-gray-900 mb-4">Add New Experience</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company *
            </label>
            <input
              type="text"
              value={newExperience.company || ''}
              onChange={(e) => setNewExperience(prev => ({ ...prev, company: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Company Name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Position *
            </label>
            <input
              type="text"
              value={newExperience.position || ''}
              onChange={(e) => setNewExperience(prev => ({ ...prev, position: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Job Title"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="month"
              value={newExperience.startDate || ''}
              onChange={(e) => setNewExperience(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <div className="space-y-2">
              <input
                type="month"
                value={newExperience.endDate || ''}
                onChange={(e) => setNewExperience(prev => ({ ...prev, endDate: e.target.value }))}
                disabled={newExperience.current}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              />
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={newExperience.current || false}
                  onChange={(e) => setNewExperience(prev => ({ ...prev, current: e.target.checked }))}
                  className="mr-2"
                />
                <span className="text-sm text-gray-600">Currently working here</span>
              </label>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Job Responsibilities
          </label>
          {(newExperience.description || []).map((desc, index) => (
            <div key={index} className="flex mb-2">
              <input
                type="text"
                value={desc}
                onChange={(e) => updateDescriptionItem('description', index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe your responsibilities..."
              />
              <button
                onClick={() => removeDescriptionItem('description', index)}
                className="ml-2 text-red-600 hover:text-red-800"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            onClick={() => addDescriptionItem('description')}
            className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add responsibility
          </button>
        </div>

        {/* Achievements */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Key Achievements
          </label>
          {(newExperience.achievements || []).map((achievement, index) => (
            <div key={index} className="flex mb-2">
              <input
                type="text"
                value={achievement}
                onChange={(e) => updateDescriptionItem('achievements', index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Quantify your achievements with numbers..."
              />
              <button
                onClick={() => removeDescriptionItem('achievements', index)}
                className="ml-2 text-red-600 hover:text-red-800"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            onClick={() => addDescriptionItem('achievements')}
            className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add achievement
          </button>
        </div>

        <button
          onClick={addExperience}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Experience
        </button>
      </div>
    </div>
  );
}