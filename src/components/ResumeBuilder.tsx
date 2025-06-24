import React, { useState } from 'react';
import { PersonalInfoForm } from './forms/PersonalInfoForm';
import { ExperienceForm } from './forms/ExperienceForm';
import { EducationForm } from './forms/EducationForm';
import { SkillsForm } from './forms/SkillsForm';
import { ProjectsForm } from './forms/ProjectsForm';
import { TemplateSelector } from './TemplateSelector';
import { Resume } from '../types/resume';
import { FileText, Sparkles } from 'lucide-react';

interface ResumeBuilderProps {
  resume: Resume;
  onResumeChange: (resume: Resume) => void;
}

export function ResumeBuilder({ resume, onResumeChange }: ResumeBuilderProps) {
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);

  const handleTemplateSelect = (templateData: Resume) => {
    onResumeChange(templateData);
  };

  const isResumeEmpty = () => {
    return !resume.personalInfo.fullName && 
           resume.experience.length === 0 && 
           resume.education.length === 0 && 
           resume.skills.length === 0 && 
           resume.projects.length === 0;
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Build Your Resume
        </h2>
        <p className="text-gray-600 text-sm sm:text-base px-4 mb-6">
          Fill out each section to create a professional, ATS-optimized resume
        </p>

        {/* Template Selector Button */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <button
            onClick={() => setShowTemplateSelector(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Sparkles className="h-5 w-5" />
            <span className="font-medium">Choose Professional Template</span>
          </button>
          
          {!isResumeEmpty() && (
            <button
              onClick={() => onResumeChange({
                personalInfo: {
                  fullName: '',
                  email: '',
                  phone: '',
                  location: '',
                  linkedin: '',
                  github: '',
                  website: '',
                  summary: ''
                },
                experience: [],
                education: [],
                skills: [],
                projects: []
              })}
              className="text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg border border-gray-300 hover:border-gray-400 transition-colors flex items-center space-x-2"
            >
              <FileText className="h-4 w-4" />
              <span>Start from Scratch</span>
            </button>
          )}
        </div>

        {isResumeEmpty() && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-center space-x-2 text-blue-700">
              <Sparkles className="h-5 w-5" />
              <p className="text-sm font-medium">
                💡 Pro Tip: Start with a professional template to save time and ensure best practices!
              </p>
            </div>
          </div>
        )}
      </div>
      
      <div className="space-y-6 sm:space-y-8">
        <PersonalInfoForm
          personalInfo={resume.personalInfo}
          onChange={(personalInfo) => onResumeChange({ ...resume, personalInfo })}
        />
        
        <ExperienceForm
          experience={resume.experience}
          onChange={(experience) => onResumeChange({ ...resume, experience })}
        />
        
        <EducationForm
          education={resume.education}
          onChange={(education) => onResumeChange({ ...resume, education })}
        />
        
        <SkillsForm
          skills={resume.skills}
          onChange={(skills) => onResumeChange({ ...resume, skills })}
        />
        
        <ProjectsForm
          projects={resume.projects}
          onChange={(projects) => onResumeChange({ ...resume, projects })}
        />
      </div>

      {/* Template Selector Modal */}
      {showTemplateSelector && (
        <TemplateSelector
          onSelectTemplate={handleTemplateSelect}
          onClose={() => setShowTemplateSelector(false)}
        />
      )}
    </div>
  );
}