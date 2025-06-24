import { Resume, ChatMessage } from '../types/resume';
import { openaiService } from './openaiService';

export class AIAssistant {
  private conversationHistory: ChatMessage[] = [];
  
  async generateResponse(userMessage: string, resume: Resume): Promise<string> {
    try {
      // Always use OpenAI service for generating responses
      const response = await openaiService.generateResumeAdvice(userMessage, resume);
      
      // Store in conversation history
      this.conversationHistory.push({
        id: Date.now().toString(),
        type: 'user',
        content: userMessage,
        timestamp: new Date()
      });
      
      this.conversationHistory.push({
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response,
        timestamp: new Date()
      });
      
      return response;
    } catch (error) {
      console.error('Error generating AI response:', error);
      
      // If there's an error, inform the user about the API key requirement
      if (error instanceof Error && error.message.includes('API key')) {
        return "I need an OpenAI API key to provide personalized resume advice. Please add your API key in the configuration to unlock AI-powered features including:\n\n• Personalized resume writing guidance\n• ATS optimization strategies\n• Industry-specific advice\n• Template customization help\n• Achievement writing assistance\n• Keyword optimization\n\nOnce configured, I'll be able to analyze your specific resume and provide targeted, actionable advice to help you land your dream job!";
      }
      
      return "I'm having trouble processing your request right now. Please check your internet connection and try again. If the problem persists, please verify your OpenAI API key configuration.";
    }
  }
  
  getConversationHistory(): ChatMessage[] {
    return this.conversationHistory;
  }
  
  clearHistory(): void {
    this.conversationHistory = [];
  }
}