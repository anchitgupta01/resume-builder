import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader, Key, Sparkles } from 'lucide-react';
import { ChatMessage, Resume } from '../types/resume';
import { AIAssistant } from '../utils/aiAssistant';
import { resumeTemplates } from '../data/resumeTemplates';

interface AIChatProps {
  resume: Resume;
}

export function AIChat({ resume }: AIChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hi! I'm your AI resume assistant powered by OpenAI. I'm here to help you create a compelling, ATS-optimized resume. I can help you with writing better summaries, improving your experience descriptions, adding impactful achievements, and optimizing for keywords. What would you like to work on?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const aiAssistant = useRef(new AIAssistant());

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

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
      const response = await aiAssistant.current.generateResponse(inputMessage, resume);
      
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
        content: "I apologize, but I'm having trouble processing your request right now. Please make sure your OpenAI API key is configured correctly, or try again later.",
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
    "How can I improve my professional summary?",
    "Help me write better achievement statements",
    "What keywords should I include for ATS?",
    "How can I make my experience more impactful?",
    "What projects should I add to my resume?",
    "Show me professional resume templates",
    "How do I quantify my achievements?",
    "What skills are most important for my field?"
  ];

  const handleQuickQuestion = (question: string) => {
    if (question === "Show me professional resume templates") {
      const templateInfo = resumeTemplates.map(t => 
        `• ${t.name} (${t.level} level) - ${t.description}`
      ).join('\n');
      
      const templateMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'assistant',
        content: `Here are our professional resume templates:\n\n${templateInfo}\n\nTo use a template, go to the Builder tab and click "Choose Professional Template". Each template is crafted by experts and optimized for ATS systems. Would you like specific advice about which template might work best for your career level and industry?`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, templateMessage]);
    } else {
      setInputMessage(question);
    }
  };

  const hasApiKey = !!import.meta.env.VITE_OPENAI_API_KEY;

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
                <p className="text-gray-600 text-sm">Get personalized advice powered by OpenAI</p>
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
                To enable AI-powered features, add your OpenAI API key to your environment variables:
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
                  <p className="whitespace-pre-wrap text-sm sm:text-base">{message.content}</p>
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
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[85%] sm:max-w-3xl flex space-x-2 sm:space-x-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="px-3 sm:px-4 py-2 sm:py-3 rounded-lg bg-gray-100">
                  <div className="flex items-center space-x-2">
                    <Loader className="h-4 w-4 animate-spin" />
                    <span className="text-gray-600 text-sm sm:text-base">AI is analyzing and responding...</span>
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
              <p className="text-sm font-medium text-gray-700">Quick questions to get started:</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {quickQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickQuestion(question)}
                  className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-left"
                >
                  {question}
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
              placeholder={hasApiKey ? "Ask me anything about your resume..." : "Configure OpenAI API key to enable AI features..."}
              className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm sm:text-base"
              rows={2}
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center sm:justify-start"
            >
              <Send className="h-4 w-4" />
              <span className="ml-2 sm:hidden">Send</span>
            </button>
          </div>
          
          {!hasApiKey && (
            <p className="text-xs text-gray-500 mt-2">
              💡 Add your OpenAI API key to unlock AI-powered resume advice and analysis
            </p>
          )}
        </div>
      </div>
    </div>
  );
}