import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader, Key, Sparkles, Zap, TrendingUp, CheckCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage, Resume } from '../types/resume';
import { openaiService } from '../utils/openaiService';
import { resumeTemplates } from '../data/resumeTemplates';

interface AIChatProps {
  resume: Resume;
  onResumeChange?: (resume: Resume) => void;
}

export function AIChat({ resume, onResumeChange }: AIChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hi! I'm your AI resume assistant powered by OpenAI. I can help you:\n\n🔧 **Fix & Optimize Your Resume** - I can automatically improve your resume to increase ATS scores\n\n📝 **Write Better Content** - Professional summaries, achievement statements, and descriptions\n\n🎯 **ATS Optimization** - Keyword integration and formatting for applicant tracking systems\n\n📊 **Analyze & Score** - Detailed analysis with specific improvement recommendations\n\n🎨 **Template Guidance** - Help customize professional templates to your experience\n\nJust ask me to \"fix my resume\" or ask any specific question about improving your resume!",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFixingResume, setIsFixingResume] = useState(false);
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const detectResumeFixRequest = (message: string): boolean => {
    const fixKeywords = [
      'fix my resume', 'improve my resume', 'optimize my resume', 'fix resume',
      'improve resume', 'optimize resume', 'make my resume better', 'enhance my resume',
      'increase ats score', 'improve ats score', 'optimize for ats', 'fix ats',
      'make resume ats friendly', 'improve resume score', 'update my resume',
      'enhance resume', 'better resume', 'optimize resume'
    ];
    
    return fixKeywords.some(keyword => 
      message.toLowerCase().includes(keyword.toLowerCase())
    );
  };

  const handleResumeFixing = async (userMessage: string) => {
    if (!onResumeChange) {
      const errorMsg: ChatMessage = {
        id: Date.now().toString(),
        type: 'assistant',
        content: "❌ **Resume modification is not available in this context.** Please ensure you're using the AI assistant from the main application where resume changes can be applied.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
      return;
    }

    setIsFixingResume(true);
    
    try {
      // Add user message
      const userMsg: ChatMessage = {
        id: Date.now().toString(),
        type: 'user',
        content: userMessage,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMsg]);

      // Add processing message
      const processingMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: "🔧 **Analyzing and fixing your resume...**\n\nI'm applying AI-powered optimizations to:\n• Professional summary enhancement\n• Experience achievement quantification\n• Skills optimization\n• Keyword integration\n• ATS compatibility improvements\n\nThis will take a moment...",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, processingMsg]);

      // Call the resume fixing service
      const fixResult = await openaiService.fixResumeForATS(resume);
      
      // Apply the improvements to the resume
      onResumeChange(fixResult.improvedResume);

      // Create success message
      const successMsg: ChatMessage = {
        id: (Date.now() + 2).toString(),
        type: 'assistant',
        content: `✅ **Resume Successfully Optimized!**\n\n**Improvements Applied:**\n${fixResult.improvements.map(improvement => `• ${improvement}`).join('\n')}\n\n**Expected ATS Score Increase:** +${fixResult.expectedScoreIncrease} points\n\n🎯 **What's Changed:**\nYour resume has been automatically updated with optimized content. Check the Builder and Preview tabs to see the improvements!\n\n💡 **Next Steps:**\n• Review the changes in the Builder tab\n• Check your new ATS score in the Preview tab\n• Make any additional personal adjustments\n• Download your improved resume\n\nWould you like me to explain any specific improvements or help with additional optimizations?`,
        timestamp: new Date()
      };

      // Remove processing message and add success message
      setMessages(prev => prev.slice(0, -1).concat(successMsg));

    } catch (error) {
      console.error('Error fixing resume:', error);
      
      const errorMsg: ChatMessage = {
        id: (Date.now() + 3).toString(),
        type: 'assistant',
        content: `❌ **Resume Fixing Error**\n\n${error instanceof Error ? error.message : 'An error occurred while fixing your resume.'}\n\nPlease ensure your OpenAI API key is configured correctly, or try asking me specific questions about improving individual sections of your resume.`,
        timestamp: new Date()
      };

      // Remove processing message and add error message
      setMessages(prev => prev.slice(0, -1).concat(errorMsg));
    } finally {
      setIsFixingResume(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading || isFixingResume) return;

    // Check if this is a resume fixing request
    if (detectResumeFixRequest(inputMessage)) {
      await handleResumeFixing(inputMessage);
      setInputMessage('');
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await openaiService.generateResumeAdvice(inputMessage, resume);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `❌ **Error**: ${error instanceof Error ? error.message : 'An error occurred while processing your request.'}\n\nPlease ensure your OpenAI API key is configured correctly, or try again later.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickQuestions = [
    "Fix my resume and increase ATS score",
    "How can I improve my professional summary?",
    "Help me write better achievement statements",
    "What keywords should I include for ATS?",
    "How can I make my experience more impactful?",
    "What projects should I add to my resume?",
    "Show me professional resume templates",
    "How do I quantify my achievements?"
  ];

  const handleQuickQuestion = (question: string) => {
    if (question === "Show me professional resume templates") {
      const templateInfo = resumeTemplates.map(t => 
        `• ${t.name} (${t.level} level) - ${t.description}`
      ).join('\n');
      
      const templateMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'assistant',
        content: `Here are our professional resume templates:\n\n${templateInfo}\n\nTo use a template, go to the Builder tab and click "Choose Professional Template". Each template is crafted by experts and optimized for ATS systems. All template content is fully editable - you can customize every section with your own experience, skills, and achievements. Would you like specific advice about which template might work best for your career level and industry?`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, templateMessage]);
    } else if (question === "Fix my resume and increase ATS score") {
      handleResumeFixing(question);
    } else {
      setInputMessage(question);
    }
  };

  const hasApiKey = !!import.meta.env.VITE_OPENAI_API_KEY;
  const canModifyResume = !!onResumeChange;

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col p-4 sm:p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex-1 flex flex-col min-h-0">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-lg flex-shrink-0">
                <Bot className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  AI Resume Assistant
                </h2>
                <div className="flex items-center space-x-2">
                  <p className="text-gray-600 text-sm">Powered by OpenAI</p>
                  {canModifyResume && hasApiKey && (
                    <div className="flex items-center space-x-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs">
                      <CheckCircle className="h-3 w-3" />
                      <span>Can modify resume</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {!hasApiKey && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                <div className="flex items-center space-x-1 text-amber-600 bg-amber-50 px-3 py-1 rounded-full text-sm">
                  <Key className="h-4 w-4" />
                  <span>API Key Required</span>
                </div>
                <button
                  onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                  className="text-blue-600 hover:text-blue-800 text-sm underline"
                >
                  Configure
                </button>
              </div>
            )}
          </div>
          
          {/* API Key Configuration */}
          {showApiKeyInput && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">OpenAI API Configuration</h4>
              <p className="text-sm text-blue-700 mb-3">
                To enable AI-powered features including automatic resume fixing, add your OpenAI API key:
              </p>
              <div className="bg-blue-100 p-3 rounded font-mono text-sm text-blue-800 break-all">
                VITE_OPENAI_API_KEY=your_api_key_here
              </div>
              <p className="text-xs text-blue-600 mt-2">
                Get your API key from{' '}
                <a 
                  href="https://platform.openai.com/api-keys" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="underline"
                >
                  OpenAI Platform
                </a>
              </p>
            </div>
          )}

          {/* Resume Modification Status */}
          {!canModifyResume && (
            <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-center space-x-3">
                <Key className="h-5 w-5 text-amber-600" />
                <div>
                  <h4 className="font-medium text-amber-900">Limited Functionality</h4>
                  <p className="text-sm text-amber-700 mt-1">
                    Resume modification is not available in this context. I can provide advice but cannot directly edit your resume.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 min-h-0">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-3xl flex ${
                  message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
                } space-x-2 sm:space-x-3`}
              >
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                  }`}
                >
                  {message.type === 'user' ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>
                <div
                  className={`px-3 sm:px-4 py-2 sm:py-3 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="text-sm sm:text-base">
                    <ReactMarkdown
                      className={`prose prose-sm max-w-none ${
                        message.type === 'user' ? 'prose-invert' : ''
                      }`}
                      components={{
                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                        ul: ({ children }) => <ul className="mb-2 last:mb-0 pl-4">{children}</ul>,
                        ol: ({ children }) => <ol className="mb-2 last:mb-0 pl-4">{children}</ol>,
                        li: ({ children }) => <li className="mb-1">{children}</li>,
                        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                        em: ({ children }) => <em className="italic">{children}</em>,
                        code: ({ children }) => (
                          <code className={`px-1 py-0.5 rounded text-xs font-mono ${
                            message.type === 'user' 
                              ? 'bg-blue-500 text-blue-100' 
                              : 'bg-gray-200 text-gray-800'
                          }`}>
                            {children}
                          </code>
                        ),
                        h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-base font-bold mb-2">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-sm font-bold mb-1">{children}</h3>,
                        h4: ({ children }) => <h4 className="text-sm font-semibold mb-1">{children}</h4>,
                        blockquote: ({ children }) => (
                          <blockquote className={`border-l-4 pl-4 my-2 ${
                            message.type === 'user' 
                              ? 'border-blue-300' 
                              : 'border-gray-300'
                          }`}>
                            {children}
                          </blockquote>
                        )
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                  <p
                    className={`text-xs mt-1 sm:mt-2 ${
                      message.type === 'user' ? 'text-blue-200' : 'text-gray-500'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {(isLoading || isFixingResume) && (
            <div className="flex justify-start">
              <div className="max-w-[85%] sm:max-w-3xl flex space-x-2 sm:space-x-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="px-3 sm:px-4 py-2 sm:py-3 rounded-lg bg-gray-100">
                  <div className="flex items-center space-x-2">
                    <Loader className="h-4 w-4 animate-spin" />
                    <span className="text-gray-600 text-sm sm:text-base">
                      {isFixingResume ? 'AI is fixing your resume...' : 'AI is analyzing and responding...'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Questions */}
        {messages.length === 1 && (
          <div className="px-4 sm:px-6 py-4 border-t border-gray-200 flex-shrink-0">
            <div className="flex items-center space-x-2 mb-3">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <p className="text-sm font-medium text-gray-700">Quick actions to get started:</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {quickQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickQuestion(question)}
                  disabled={(!hasApiKey || !canModifyResume) && question.includes('Fix my resume')}
                  className={`px-3 py-2 text-sm rounded-lg transition-colors text-left flex items-center space-x-2 ${
                    question.includes('Fix my resume') 
                      ? 'bg-gradient-to-r from-purple-100 to-blue-100 hover:from-purple-200 hover:to-blue-200 text-purple-800 font-medium'
                      : 'bg-gray-100 hover:bg-gray-200'
                  } ${(!hasApiKey || !canModifyResume) && question.includes('Fix my resume') ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {question.includes('Fix my resume') && <Zap className="h-4 w-4" />}
                  {question.includes('ATS') && <TrendingUp className="h-4 w-4" />}
                  <span>{question}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 sm:p-6 border-t border-gray-200 flex-shrink-0">
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                !hasApiKey 
                  ? "Configure OpenAI API key to enable AI features..." 
                  : !canModifyResume
                  ? "Ask me questions about resume improvement (modification not available)..."
                  : "Ask me to fix your resume or any question about improving it..."
              }
              className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm sm:text-base"
              rows={2}
              disabled={isLoading || isFixingResume || !hasApiKey}
            />
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading || isFixingResume || !hasApiKey}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center sm:justify-start"
            >
              <Send className="h-4 w-4" />
              <span className="ml-2 sm:hidden">Send</span>
            </button>
          </div>
          
          {!hasApiKey && (
            <p className="text-xs text-gray-500 mt-2">
              💡 Add your OpenAI API key to unlock AI-powered resume fixing and analysis
            </p>
          )}
          
          {hasApiKey && !canModifyResume && (
            <p className="text-xs text-amber-600 mt-2">
              ⚠️ Resume modification is not available in this context - I can provide advice only
            </p>
          )}
        </div>
      </div>
    </div>
  );
}