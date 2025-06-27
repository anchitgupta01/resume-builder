import React, { useState } from 'react';
import { Zap, Plus, Trash2 } from 'lucide-react';
import { Skill } from '../../types/resume';

interface SkillsFormProps {
  skills: Skill[];
  onChange: (skills: Skill[]) => void;
}

export function SkillsForm({ skills, onChange }: SkillsFormProps) {
  const [newSkill, setNewSkill] = useState<Partial<Skill>>({
    name: '',
    category: 'technical',
    proficiency: 'intermediate'
  });

  const addSkill = () => {
    if (newSkill.name) {
      const skill: Skill = {
        id: Date.now().toString(),
        name: newSkill.name,
        category: newSkill.category || 'technical',
        proficiency: newSkill.proficiency || 'intermediate'
      };
      
      onChange([...skills, skill]);
      setNewSkill({
        name: '',
        category: 'technical',
        proficiency: 'intermediate'
      });
    }
  };

  const removeSkill = (id: string) => {
    onChange(skills.filter(skill => skill.id !== id));
  };

  const skillsByCategory = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  const categoryLabels = {
    technical: 'Technical Skills',
    soft: 'Soft Skills',
    language: 'Languages',
    certification: 'Certifications'
  };

  const proficiencyColors = {
    beginner: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
    intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
    advanced: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
    expert: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
      <div className="flex items-center space-x-3 mb-4 sm:mb-6">
        <div className="bg-orange-100 dark:bg-orange-900 p-2 rounded-lg">
          <Zap className="h-5 w-5 text-orange-600 dark:text-orange-400" />
        </div>
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Skills</h3>
      </div>

      {/* Existing Skills by Category */}
      <div className="space-y-6 mb-6">
        {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
          <div key={category}>
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">
              {categoryLabels[category as keyof typeof categoryLabels]}
            </h4>
            <div className="flex flex-wrap gap-2">
              {categorySkills.map((skill) => (
                <div
                  key={skill.id}
                  className="flex items-center bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-600"
                >
                  <span className="text-sm font-medium text-gray-900 dark:text-white mr-2">
                    {skill.name}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${proficiencyColors[skill.proficiency]} mr-2`}>
                    {skill.proficiency}
                  </span>
                  <button
                    onClick={() => removeSkill(skill.id)}
                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Add New Skill */}
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 sm:p-6">
        <h4 className="font-medium text-gray-900 dark:text-white mb-4">Add New Skill</h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Skill Name *
            </label>
            <input
              type="text"
              value={newSkill.name || ''}
              onChange={(e) => setNewSkill(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="JavaScript, Leadership, etc."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category
            </label>
            <select
              value={newSkill.category || 'technical'}
              onChange={(e) => setNewSkill(prev => ({ ...prev, category: e.target.value as Skill['category'] }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="technical">Technical</option>
              <option value="soft">Soft Skills</option>
              <option value="language">Language</option>
              <option value="certification">Certification</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Proficiency
            </label>
            <select
              value={newSkill.proficiency || 'intermediate'}
              onChange={(e) => setNewSkill(prev => ({ ...prev, proficiency: e.target.value as Skill['proficiency'] }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </select>
          </div>
        </div>

        <button
          onClick={addSkill}
          className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Skill
        </button>
      </div>

      {/* Quick Add Common Skills */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h4 className="font-medium text-gray-900 dark:text-white mb-3">Quick Add Common Skills</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {[
            'JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'Git',
            'Communication', 'Leadership', 'Problem Solving', 'Teamwork',
            'Project Management', 'Data Analysis'
          ].map((skillName) => (
            <button
              key={skillName}
              onClick={() => {
                const skill: Skill = {
                  id: Date.now().toString() + Math.random(),
                  name: skillName,
                  category: ['JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'Git'].includes(skillName) ? 'technical' : 'soft',
                  proficiency: 'intermediate'
                };
                onChange([...skills, skill]);
              }}
              className="text-left px-3 py-2 text-sm bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 dark:text-white"
              disabled={skills.some(s => s.name === skillName)}
            >
              {skillName}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}