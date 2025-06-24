import React from 'react';
import { PersonalInfoForm } from './forms/PersonalInfoForm';
import { ExperienceForm } from './forms/ExperienceForm';
import { EducationForm } from './forms/EducationForm';
import { SkillsForm } from './forms/SkillsForm';
import { ProjectsForm } from './forms/ProjectsForm';
import { Resume } from '../types/resume';

interface ResumeBuilderProps {
  resume: Resume;
  onResumeChange: (resume: Resume) => void;
}

export function ResumeBuilder({ resume, onResumeChange }: ResumeBuilderProps) {
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Build Your Resume
        </h2>
        <p className="text-gray-600 text-sm sm:text-base px-4">
          Fill out each section to create a professional, ATS-optimized resume
        </p>
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
    </div>
  );
}