import React, { useState } from 'react';
import { PersonalInfoForm } from './forms/PersonalInfoForm';
import { ExperienceForm } from './forms/ExperienceForm';
import { EducationForm } from './forms/EducationForm';
import { SkillsForm } from './forms/SkillsForm';
import { ProjectsForm } from './forms/ProjectsForm';
import { TemplateSelector } from './TemplateSelector';
import { PDFUploader } from './PDFUploader';
import { BoltBadge } from './BoltBadge';
import { ResumeIcon, BoltIcon } from './icons/ResumeIcons';
import { Resume } from '../types/resume';
import { FileText, Sparkles, Edit3, Info, Upload, CheckCircle } from 'lucide-react';

interface ResumeBuilderProps {
  resume: Resume;
  onResumeChange: (resume: Resume) => void;
}

export function ResumeBuilder({ resume, onResumeChange }: ResumeBuilderProps) {
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showPDFUploader, setShowPDFUploader] = useState(false);
  const [showTemplateInfo, setShowTemplateInfo] = useState(false);
  const [showUploadSuccess, setShowUploadSuccess] = useState(false);

  const handleTemplateSelect = (templateData: Resume) => {
    onResumeChange(templateData);
    setShowTemplateInfo(true);
    // Auto-hide the info after 5 seconds
    setTimeout(() => setShowTemplateInfo(false), 5000);
  };

  const handlePDFUpload = (extractedResume: Resume) => {
    onResumeChange(extractedResume);
    setShowUploadSuccess(true);
    // Auto-hide the success message after 5 seconds
    setTimeout(() => setShowUploadSuccess(false), 5000);
  };

  const isResumeEmpty = () => {
    return !resume.personalInfo.fullName && 
           resume.experience.length === 0 && 
           resume.education.length === 0 && 
           resume.skills.length === 0 && 
           resume.projects.length === 0;
  };

  const hasTemplateContent = () => {
    return resume.experience.length > 0 || 
           resume.education.length > 0 || 
           resume.skills.length > 0 || 
           resume.projects.length > 0 ||
           resume.personalInfo.summary;
  };

  const hasApiKey = !!import.meta.env.VITE_OPENAI_API_KEY;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8 relative">
      <BoltBadge position="top-right" size="medium" />
      
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Build Your Resume
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
            Fill out each section to create a professional, ATS-optimized resume
          </p>
        </div>

        {/* Template Info Banner */}
        {showTemplateInfo && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 dark:bg-green-800 p-2 rounded-lg">
                  <Edit3 className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-left">
                  <h4 className="font-medium text-green-900 dark:text-green-100">Template Loaded Successfully!</h4>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    All content is now editable. Customize each section with your own information.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowTemplateInfo(false)}
                className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Upload Success Banner */}
        {showUploadSuccess && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 dark:bg-blue-800 p-2 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-left">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100">Resume Imported Successfully!</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Your PDF has been parsed and imported. Review and edit the extracted information below.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowUploadSuccess(false)}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <button
            onClick={() => setShowTemplateSelector(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Sparkles className="h-5 w-5" />
            <span className="font-medium">
              {hasTemplateContent() ? 'Switch Template' : 'Choose Professional Template'}
            </span>
          </button>

          <button
            onClick={() => setShowPDFUploader(true)}
            disabled={!hasApiKey}
            className={`px-6 py-3 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
              hasApiKey
                ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white hover:from-green-700 hover:to-teal-700'
                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            }`}
            title={!hasApiKey ? 'OpenAI API key required for PDF upload' : 'Upload and extract resume from PDF'}
          >
            <Upload className="h-5 w-5" />
            <span className="font-medium">Upload PDF Resume</span>
          </button>
          
          {!isResumeEmpty() && (
            <button
              onClick={() => {
                if (confirm('Are you sure you want to start from scratch? This will clear all current content.')) {
                  onResumeChange({
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
                  });
                }
              }}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-colors flex items-center space-x-2"
            >
              <FileText className="h-4 w-4" />
              <span>Start from Scratch</span>
            </button>
          )}
        </div>

        {/* Helpful Tips */}
        {isResumeEmpty() && (
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-center space-x-2 text-blue-700 dark:text-blue-300">
              <div className="w-6 h-6">
                <BoltIcon />
              </div>
              <p className="text-sm font-medium">
                💡 Pro Tip: Start with a professional template or upload your existing PDF to save time!
              </p>
            </div>
          </div>
        )}

        {hasTemplateContent() && (
          <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <div className="flex items-start space-x-3">
              <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-1">Editing Template Content</h4>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  You're working with template content. Feel free to edit, add, or remove any information 
                  to match your experience. All sections are fully customizable!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* PDF Upload Requirements */}
        {!hasApiKey && (
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-start space-x-3">
              <Upload className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">PDF Upload Feature</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  To use the PDF upload feature, add your OpenAI API key to enable intelligent text extraction and parsing.
                </p>
              </div>
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

      {/* PDF Uploader Modal */}
      {showPDFUploader && (
        <PDFUploader
          onResumeExtracted={handlePDFUpload}
          onClose={() => setShowPDFUploader(false)}
        />
      )}
    </div>
  );
}