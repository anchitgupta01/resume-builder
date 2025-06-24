import { Resume, ChatMessage } from '../types/resume';
import { openaiService } from './openaiService';

export class AIAssistant {
  private conversationHistory: ChatMessage[] = [];
  
  async generateResponse(userMessage: string, resume: Resume): Promise<string> {
    try {
      // Use OpenAI service for generating responses
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
      return "I apologize, but I'm having trouble processing your request right now. Please try again or ask me something else about your resume.";
    }
  }
  
  getConversationHistory(): ChatMessage[] {
    return this.conversationHistory;
  }
  
  clearHistory(): void {
    this.conversationHistory = [];
  }
}