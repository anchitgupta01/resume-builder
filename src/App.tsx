import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ResumeBuilder } from './components/ResumeBuilder';
import { AIChat } from './components/AIChat';
import { ResumePreview } from './components/ResumePreview';
import { AuthModal } from './components/auth/AuthModal';
import { BoltBadge } from './components/BoltBadge';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Resume } from './types/resume';
import { Loader } from 'lucide-react';

function AppContent() {
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
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  const { user, loading: authLoading } = useAuth();

  const handleResumeChange = (newResume: Resume) => {
    setResume(newResume);
  };

  const handleSignIn = () => {
    setAuthMode('signin');
    setShowAuthModal(true);
  };

  const handleSignUp = () => {
    setAuthMode('signup');
    setShowAuthModal(true);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="max-w-md w-full mx-4">
            <div className="text-center mb-8">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-lg inline-block mb-4">
                <svg className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 001 1h6a1 1 0 001-1V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                AI Resume Builder
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Create professional, ATS-optimized resumes with AI assistance
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="space-y-4">
                <button
                  onClick={handleSignIn}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Sign In
                </button>
                
                <button
                  onClick={handleSignUp}
                  className="w-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white py-3 px-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
                >
                  Create Account
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Features:</h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>• AI-powered resume optimization</li>
                  <li>• ATS compatibility analysis</li>
                  <li>• Professional templates</li>
                  <li>• PDF upload and parsing</li>
                  <li>• Real-time collaboration with AI</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bolt Badge for auth screen */}
        <BoltBadge />

        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          initialMode={authMode}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors">
      <Header 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
      />
      
      {/* Bolt Badge positioned after header */}
      <BoltBadge />
      
      <main className="flex-1 py-4 sm:py-6 lg:py-8">
        {activeTab === 'builder' && (
          <ResumeBuilder 
            resume={resume} 
            onResumeChange={handleResumeChange}
          />
        )}
        
        {activeTab === 'chat' && (
          <div className="h-full">
            <AIChat 
              resume={resume} 
              onResumeChange={handleResumeChange}
            />
          </div>
        )}
        
        {activeTab === 'preview' && (
          <ResumePreview 
            resume={resume}
          />
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;