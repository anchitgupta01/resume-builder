import React, { useState } from 'react';
import { Header } from './components/Header';
import { ResumeBuilder } from './components/ResumeBuilder';
import { AIChat } from './components/AIChat';
import { ResumePreview } from './components/ResumePreview';
import { ThemeProvider } from './contexts/ThemeContext';
import { Resume } from './types/resume';

function App() {
  const [activeTab, setActiveTab] = useState<'builder' | 'chat' | 'preview'>('builder');
  const [resume, setResume] = useState<Resume>({
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

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors">
        <Header activeTab={activeTab} onTabChange={setActiveTab} />
        
        <main className="flex-1 py-4 sm:py-6 lg:py-8">
          {activeTab === 'builder' && (
            <ResumeBuilder resume={resume} onResumeChange={setResume} />
          )}
          
          {activeTab === 'chat' && (
            <div className="h-full">
              <AIChat resume={resume} onResumeChange={setResume} />
            </div>
          )}
          
          {activeTab === 'preview' && (
            <ResumePreview resume={resume} />
          )}
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;