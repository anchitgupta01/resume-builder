import React, { useState } from 'react';
import { FileText, Search, Filter, Star, Users, Briefcase, Code, Heart, GraduationCap, Globe, Edit3 } from 'lucide-react';
import { resumeTemplates, getTemplatesByCategory, getTemplatesByLevel } from '../data/resumeTemplates';
import { ResumeTemplate, Resume } from '../types/resume';

interface TemplateSelectorProps {
  onSelectTemplate: (template: Resume) => void;
  onClose: () => void;
}

export function TemplateSelector({ onSelectTemplate, onClose }: TemplateSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'All Templates', icon: Globe },
    { id: 'technology', name: 'Technology', icon: Code },
    { id: 'business', name: 'Business', icon: Briefcase },
    { id: 'creative', name: 'Creative', icon: Star },
    { id: 'healthcare', name: 'Healthcare', icon: Heart },
    { id: 'education', name: 'Education', icon: GraduationCap }
  ];

  const levels = [
    { id: 'all', name: 'All Levels' },
    { id: 'entry', name: 'Entry Level' },
    { id: 'mid', name: 'Mid Level' },
    { id: 'senior', name: 'Senior Level' },
    { id: 'executive', name: 'Executive' }
  ];

  const filteredTemplates = resumeTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesLevel = selectedLevel === 'all' || template.level === selectedLevel;
    
    return matchesSearch && matchesCategory && matchesLevel;
  });

  const handleSelectTemplate = (template: ResumeTemplate) => {
    // Keep all template content but clear only personal contact info for privacy
    const editableTemplate = {
      ...template.data,
      personalInfo: {
        ...template.data.personalInfo,
        fullName: '',
        email: '',
        phone: '',
        location: '',
        linkedin: '',
        github: '',
        website: ''
        // Keep the professional summary as it's valuable content to edit
      }
    };
    
    onSelectTemplate(editableTemplate);
    onClose();
  };

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.icon : Globe;
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'entry': return 'bg-green-100 text-green-800';
      case 'mid': return 'bg-blue-100 text-blue-800';
      case 'senior': return 'bg-purple-100 text-purple-800';
      case 'executive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Choose a Template</h2>
                <p className="text-gray-600">Select a professional template and customize all content to match your experience</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          {/* Important Notice */}
          <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start space-x-3">
              <Edit3 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">Fully Customizable Templates</h4>
                <p className="text-sm text-blue-700">
                  All template content is completely editable! Use the professional examples as a starting point, 
                  then customize every section with your own experience, skills, and achievements.
                </p>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="flex-shrink-0">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Level Filter */}
            <div className="flex-shrink-0">
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {levels.map(level => (
                  <option key={level.id} value={level.id}>
                    {level.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-280px)]">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
              <p className="text-gray-600">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => {
                const CategoryIcon = getCategoryIcon(template.category);
                
                return (
                  <div
                    key={template.id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-200 cursor-pointer group hover:border-blue-300"
                    onClick={() => handleSelectTemplate(template)}
                  >
                    {/* Template Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-gray-100 p-2 rounded-lg group-hover:bg-blue-100 transition-colors">
                          <CategoryIcon className="h-5 w-5 text-gray-600 group-hover:text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {template.name}
                          </h3>
                          <span className={`inline-block px-2 py-1 text-xs rounded-full ${getLevelColor(template.level)}`}>
                            {template.level.charAt(0).toUpperCase() + template.level.slice(1)}
                          </span>
                        </div>
                      </div>
                      <Edit3 className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </div>

                    {/* Template Description */}
                    <p className="text-gray-600 text-sm mb-4">
                      {template.description}
                    </p>

                    {/* Template Preview */}
                    <div className="bg-gray-50 rounded-lg p-3 mb-4 group-hover:bg-blue-50 transition-colors">
                      <p className="text-xs text-gray-700 italic group-hover:text-blue-700">
                        "{template.preview}"
                      </p>
                    </div>

                    {/* Content Preview */}
                    <div className="mb-4 text-xs text-gray-600">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Includes:</span>
                        <span className="text-green-600 font-medium">✓ Fully Editable</span>
                      </div>
                      <ul className="space-y-1">
                        <li>• {template.data.experience.length} work experience examples</li>
                        <li>• {template.data.skills.length} relevant skills</li>
                        <li>• {template.data.projects.length} project examples</li>
                        <li>• Professional summary template</li>
                      </ul>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {template.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full group-hover:bg-blue-200"
                        >
                          {tag}
                        </span>
                      ))}
                      {template.tags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full group-hover:bg-gray-200">
                          +{template.tags.length - 3} more
                        </span>
                      )}
                    </div>

                    {/* Use Template Button */}
                    <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors group-hover:bg-blue-700 flex items-center justify-center space-x-2">
                      <Edit3 className="h-4 w-4" />
                      <span>Use & Customize</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
            <p className="text-sm text-gray-600">
              {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} available
            </p>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Edit3 className="h-4 w-4" />
                <span>100% Customizable</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>Expert Crafted</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}