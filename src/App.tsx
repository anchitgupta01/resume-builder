import React, { useState } from 'react';
import { Header } from './components/Header';
import { ResumeBuilder } from './components/ResumeBuilder';
import { AIChat } from './components/AIChat';
import { ResumePreview } from './components/ResumePreview';
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
    <div className="min-h-screen bg-gray-50">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="py-8">
        {activeTab === 'builder' && (
          <ResumeBuilder resume={resume} onResumeChange={setResume} />
        )}
        
        {activeTab === 'chat' && (
          <div className="max-w-4xl mx-auto p-6">
            <AIChat resume={resume} />
          </div>
        )}
        
        {activeTab === 'preview' && (
          <ResumePreview resume={resume} />
        )}
      </main>
    </div>
  );
}

export default App;