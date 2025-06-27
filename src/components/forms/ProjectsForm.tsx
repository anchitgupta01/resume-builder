import React, { useState } from 'react';
import { Code, Plus, Trash2, ExternalLink, Github, Edit3, Save, X } from 'lucide-react';
import { Project } from '../../types/resume';

interface ProjectsFormProps {
  projects: Project[];
  onChange: (projects: Project[]) => void;
}

export function ProjectsForm({ projects, onChange }: ProjectsFormProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<Project | null>(null);
  const [newProject, setNewProject] = useState<Partial<Project>>({
    name: '',
    description: '',
    technologies: [],
    link: '',
    github: ''
  });
  const [techInput, setTechInput] = useState('');
  const [editTechInput, setEditTechInput] = useState('');

  const addProject = () => {
    if (newProject.name && newProject.description) {
      const project: Project = {
        id: Date.now().toString(),
        name: newProject.name,
        description: newProject.description,
        technologies: newProject.technologies || [],
        link: newProject.link || '',
        github: newProject.github || ''
      };
      
      onChange([...projects, project]);
      setNewProject({
        name: '',
        description: '',
        technologies: [],
        link: '',
        github: ''
      });
    }
  };

  const removeProject = (id: string) => {
    onChange(projects.filter(project => project.id !== id));
  };

  const startEditing = (project: Project) => {
    setEditingId(project.id);
    setEditingData({ ...project });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingData(null);
    setEditTechInput('');
  };

  const saveEditing = () => {
    if (editingData) {
      onChange(projects.map(proj => proj.id === editingId ? editingData : proj));
      setEditingId(null);
      setEditingData(null);
      setEditTechInput('');
    }
  };

  const updateEditingData = (field: keyof Project, value: any) => {
    if (editingData) {
      setEditingData({ ...editingData, [field]: value });
    }
  };

  const addTechnology = (isEditing = false) => {
    const input = isEditing ? editTechInput : techInput;
    const currentTechnologies = isEditing ? editingData?.technologies || [] : newProject.technologies || [];
    
    if (input.trim() && !currentTechnologies.includes(input.trim())) {
      if (isEditing && editingData) {
        updateEditingData('technologies', [...currentTechnologies, input.trim()]);
        setEditTechInput('');
      } else {
        setNewProject(prev => ({
          ...prev,
          technologies: [...currentTechnologies, input.trim()]
        }));
        setTechInput('');
      }
    }
  };

  const removeTechnology = (tech: string, isEditing = false) => {
    if (isEditing && editingData) {
      updateEditingData('technologies', editingData.technologies.filter(t => t !== tech));
    } else {
      setNewProject(prev => ({
        ...prev,
        technologies: (prev.technologies || []).filter(t => t !== tech)
      }));
    }
  };

  const handleTechKeyPress = (e: React.KeyboardEvent, isEditing = false) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTechnology(isEditing);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
      <div className="flex items-center space-x-3 mb-4 sm:mb-6">
        <div className="bg-indigo-100 dark:bg-indigo-900 p-2 rounded-lg">
          <Code className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Projects</h3>
      </div>

      {/* Existing Projects */}
      <div className="space-y-4 mb-6">
        {projects.map((project) => (
          <div key={project.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
            {editingId === project.id && editingData ? (
              // Edit Mode
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 space-y-2 sm:space-y-0">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Edit Project</h4>
                  <div className="flex space-x-2">
                    <button
                      onClick={saveEditing}
                      className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 p-1"
                      title="Save changes"
                    >
                      <Save className="h-4 w-4" />
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 p-1"
                      title="Cancel editing"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project Name</label>
                  <input
                    type="text"
                    value={editingData.name}
                    onChange={(e) => updateEditingData('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea
                    value={editingData.description}
                    onChange={(e) => updateEditingData('description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      <ExternalLink className="h-4 w-4 inline mr-1" />
                      Live Demo URL
                    </label>
                    <input
                      type="url"
                      value={editingData.link}
                      onChange={(e) => updateEditingData('link', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      <Github className="h-4 w-4 inline mr-1" />
                      GitHub Repository
                    </label>
                    <input
                      type="url"
                      value={editingData.github}
                      onChange={(e) => updateEditingData('github', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Technologies Used</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {editingData.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 text-sm rounded-full"
                      >
                        {tech}
                        <button
                          onClick={() => removeTechnology(tech, true)}
                          className="ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={editTechInput}
                      onChange={(e) => setEditTechInput(e.target.value)}
                      onKeyPress={(e) => handleTechKeyPress(e, true)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="React, Node.js, Python, etc."
                    />
                    <button
                      onClick={() => addTechnology(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // View Mode
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-3 space-y-3 lg:space-y-0">
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mb-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{project.name}</h4>
                    <div className="flex items-center space-x-2 mt-1 sm:mt-0">
                      {project.link && (
                        <a
                          href={project.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                      {project.github && (
                        <a
                          href={project.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300"
                        >
                          <Github className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-3 text-sm sm:text-base">{project.description}</p>
                  {project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 text-xs rounded-full"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex space-x-2 lg:ml-4">
                  <button
                    onClick={() => startEditing(project)}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                    title="Edit project"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => removeProject(project.id)}
                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                    title="Delete project"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add New Project */}
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 sm:p-6">
        <h4 className="font-medium text-gray-900 dark:text-white mb-4">Add New Project</h4>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Project Name *
            </label>
            <input
              type="text"
              value={newProject.name || ''}
              onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="My Awesome Project"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description *
            </label>
            <textarea
              value={newProject.description || ''}
              onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
              placeholder="Describe what the project does, the problem it solves, and your role in it..."
            />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <ExternalLink className="h-4 w-4 inline mr-1" />
                Live Demo URL
              </label>
              <input
                type="url"
                value={newProject.link || ''}
                onChange={(e) => setNewProject(prev => ({ ...prev, link: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="https://myproject.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Github className="h-4 w-4 inline mr-1" />
                GitHub Repository
              </label>
              <input
                type="url"
                value={newProject.github || ''}
                onChange={(e) => setNewProject(prev => ({ ...prev, github: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="https://github.com/username/project"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Technologies Used
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {(newProject.technologies || []).map((tech) => (
                <span
                  key={tech}
                  className="flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 text-sm rounded-full"
                >
                  {tech}
                  <button
                    onClick={() => removeTechnology(tech)}
                    className="ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyPress={handleTechKeyPress}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="React, Node.js, Python, etc."
              />
              <button
                onClick={() => addTechnology()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={addProject}
          className="mt-4 w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Project
        </button>
      </div>
    </div>
  );
}