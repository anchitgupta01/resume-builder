import React, { useState } from 'react';
import { Code, Plus, Trash2, ExternalLink, Github } from 'lucide-react';
import { Project } from '../../types/resume';

interface ProjectsFormProps {
  projects: Project[];
  onChange: (projects: Project[]) => void;
}

export function ProjectsForm({ projects, onChange }: ProjectsFormProps) {
  const [newProject, setNewProject] = useState<Partial<Project>>({
    name: '',
    description: '',
    technologies: [],
    link: '',
    github: ''
  });
  const [techInput, setTechInput] = useState('');

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

  const addTechnology = () => {
    if (techInput.trim() && !newProject.technologies?.includes(techInput.trim())) {
      setNewProject(prev => ({
        ...prev,
        technologies: [...(prev.technologies || []), techInput.trim()]
      }));
      setTechInput('');
    }
  };

  const removeTechnology = (tech: string) => {
    setNewProject(prev => ({
      ...prev,
      technologies: (prev.technologies || []).filter(t => t !== tech)
    }));
  };

  const handleTechKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTechnology();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-indigo-100 p-2 rounded-lg">
          <Code className="h-5 w-5 text-indigo-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900">Projects</h3>
      </div>

      {/* Existing Projects */}
      <div className="space-y-4 mb-6">
        {projects.map((project) => (
          <div key={project.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h4 className="font-semibold text-gray-900">{project.name}</h4>
                  {project.link && (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-gray-800"
                    >
                      <Github className="h-4 w-4" />
                    </a>
                  )}
                </div>
                <p className="text-gray-600 mb-3">{project.description}</p>
                {project.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => removeProject(project.id)}
                className="text-red-600 hover:text-red-800 ml-4"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add New Project */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
        <h4 className="font-medium text-gray-900 mb-4">Add New Project</h4>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Name *
            </label>
            <input
              type="text"
              value={newProject.name || ''}
              onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="My Awesome Project"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              value={newProject.description || ''}
              onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe what the project does, the problem it solves, and your role in it..."
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <ExternalLink className="h-4 w-4 inline mr-1" />
                Live Demo URL
              </label>
              <input
                type="url"
                value={newProject.link || ''}
                onChange={(e) => setNewProject(prev => ({ ...prev, link: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://myproject.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Github className="h-4 w-4 inline mr-1" />
                GitHub Repository
              </label>
              <input
                type="url"
                value={newProject.github || ''}
                onChange={(e) => setNewProject(prev => ({ ...prev, github: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://github.com/username/project"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Technologies Used
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {(newProject.technologies || []).map((tech) => (
                <span
                  key={tech}
                  className="flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                >
                  {tech}
                  <button
                    onClick={() => removeTechnology(tech)}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex">
              <input
                type="text"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyPress={handleTechKeyPress}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="React, Node.js, Python, etc."
              />
              <button
                onClick={addTechnology}
                className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={addProject}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Project
        </button>
      </div>
    </div>
  );
}