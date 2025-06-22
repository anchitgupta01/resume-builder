import React from 'react';
import { FileText, Zap, MessageCircle } from 'lucide-react';

interface HeaderProps {
  activeTab: 'builder' | 'chat' | 'preview';
  onTabChange: (tab: 'builder' | 'chat' | 'preview') => void;
}

export function Header({ activeTab, onTabChange }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">AI Resume Builder</h1>
              <p className="text-sm text-gray-500">Build ATS-optimized resumes with AI assistance</p>
            </div>
          </div>
          
          <nav className="flex space-x-1">
            <button
              onClick={() => onTabChange('builder')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'builder'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <FileText className="h-4 w-4 inline mr-2" />
              Builder
            </button>
            <button
              onClick={() => onTabChange('chat')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'chat'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <MessageCircle className="h-4 w-4 inline mr-2" />
              AI Assistant
            </button>
            <button
              onClick={() => onTabChange('preview')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'preview'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Zap className="h-4 w-4 inline mr-2" />
              Preview & ATS
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}