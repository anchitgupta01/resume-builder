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
    beginner: 'bg-red-100 text-red-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-blue-100 text-blue-800',
    expert: 'bg-green-100 text-green-800'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-orange-100 p-2 rounded-lg">
          <Zap className="h-5 w-5 text-orange-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900">Skills</h3>
      </div>

      {/* Existing Skills by Category */}
      <div className="space-y-6 mb-6">
        {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
          <div key={category}>
            <h4 className="font-medium text-gray-900 mb-3">
              {categoryLabels[category as keyof typeof categoryLabels]}
            </h4>
            <div className="flex flex-wrap gap-2">
              {categorySkills.map((skill) => (
                <div
                  key={skill.id}
                  className="flex items-center bg-gray-50 rounded-lg px-3 py-2 border"
                >
                  <span className="text-sm font-medium text-gray-900 mr-2">
                    {skill.name}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${proficiencyColors[skill.proficiency]} mr-2`}>
                    {skill.proficiency}
                  </span>
                  <button
                    onClick={() => removeSkill(skill.id)}
                    className="text-red-600 hover:text-red-800"
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
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
        <h4 className="font-medium text-gray-900 mb-4">Add New Skill</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Skill Name *
            </label>
            <input
              type="text"
              value={newSkill.name || ''}
              onChange={(e) => setNewSkill(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="JavaScript, Leadership, etc."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={newSkill.category || 'technical'}
              onChange={(e) => setNewSkill(prev => ({ ...prev, category: e.target.value as Skill['category'] }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="technical">Technical</option>
              <option value="soft">Soft Skills</option>
              <option value="language">Language</option>
              <option value="certification">Certification</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Proficiency
            </label>
            <select
              value={newSkill.proficiency || 'intermediate'}
              onChange={(e) => setNewSkill(prev => ({ ...prev, proficiency: e.target.value as Skill['proficiency'] }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Skill
        </button>
      </div>

      {/* Quick Add Common Skills */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-3">Quick Add Common Skills</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
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
              className="text-left px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
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