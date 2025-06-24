import OpenAI from 'openai';
import { Resume } from '../types/resume';

class OpenAIService {
  private openai: OpenAI | null = null;
  private isInitialized = false;

  constructor() {
    this.initializeOpenAI();
  }

  private initializeOpenAI() {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    if (!apiKey) {
      console.warn('OpenAI API key not found. AI features will use fallback responses.');
      return;
    }

    try {
      this.openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true
      });
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize OpenAI:', error);
    }
  }

  async generateResumeAdvice(userMessage: string, resume: Resume): Promise<string> {
    if (!this.isInitialized || !this.openai) {
      return this.getFallbackAdvice(userMessage, resume);
    }

    try {
      const resumeContext = this.buildResumeContext(resume);
      
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are an expert resume consultant and career advisor. You help job seekers create compelling, ATS-optimized resumes. 

Your expertise includes:
- Writing impactful professional summaries
- Crafting achievement-focused experience descriptions
- Optimizing resumes for Applicant Tracking Systems (ATS)
- Identifying relevant keywords for specific industries
- Providing actionable, specific advice

Always provide practical, actionable advice. Use specific examples when possible. Keep responses concise but comprehensive.

Current resume context:
${resumeContext}`
          },
          {
            role: "user",
            content: userMessage
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      });

      return completion.choices[0]?.message?.content || this.getFallbackAdvice(userMessage, resume);
    } catch (error) {
      console.error('OpenAI API error:', error);
      return this.getFallbackAdvice(userMessage, resume);
    }
  }

  async analyzeATSScore(resume: Resume, jobDescription?: string): Promise<{
    score: number;
    analysis: string;
    suggestions: string[];
    keywords: string[];
  }> {
    if (!this.isInitialized || !this.openai) {
      return this.getFallbackATSAnalysis(resume);
    }

    try {
      const resumeText = this.extractResumeText(resume);
      const prompt = `Analyze this resume for ATS (Applicant Tracking System) compatibility and provide a detailed assessment.

Resume Content:
${resumeText}

${jobDescription ? `Job Description for comparison:\n${jobDescription}\n` : ''}

Please provide:
1. An overall ATS score (0-100)
2. Detailed analysis of strengths and weaknesses
3. 5 specific improvement suggestions
4. 10 relevant keywords that should be included

Format your response as JSON with this structure:
{
  "score": number,
  "analysis": "detailed analysis text",
  "suggestions": ["suggestion1", "suggestion2", ...],
  "keywords": ["keyword1", "keyword2", ...]
}`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an ATS (Applicant Tracking System) expert who analyzes resumes for compatibility and optimization. Provide detailed, actionable feedback in the requested JSON format."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 800,
        temperature: 0.3
      });

      const response = completion.choices[0]?.message?.content;
      if (response) {
        try {
          return JSON.parse(response);
        } catch (parseError) {
          console.error('Failed to parse OpenAI response:', parseError);
        }
      }
    } catch (error) {
      console.error('OpenAI ATS analysis error:', error);
    }

    return this.getFallbackATSAnalysis(resume);
  }

  private buildResumeContext(resume: Resume): string {
    const context = [];
    
    if (resume.personalInfo.fullName) {
      context.push(`Name: ${resume.personalInfo.fullName}`);
    }
    
    if (resume.personalInfo.summary) {
      context.push(`Summary: ${resume.personalInfo.summary}`);
    }
    
    if (resume.experience.length > 0) {
      context.push(`Experience: ${resume.experience.length} positions`);
      resume.experience.forEach(exp => {
        context.push(`- ${exp.position} at ${exp.company}`);
      });
    }
    
    if (resume.skills.length > 0) {
      context.push(`Skills: ${resume.skills.map(s => s.name).join(', ')}`);
    }
    
    if (resume.education.length > 0) {
      context.push(`Education: ${resume.education.map(e => `${e.degree} in ${e.field}`).join(', ')}`);
    }
    
    return context.join('\n');
  }

  private extractResumeText(resume: Resume): string {
    const sections = [];
    
    sections.push(`Name: ${resume.personalInfo.fullName}`);
    sections.push(`Email: ${resume.personalInfo.email}`);
    sections.push(`Phone: ${resume.personalInfo.phone}`);
    sections.push(`Location: ${resume.personalInfo.location}`);
    
    if (resume.personalInfo.summary) {
      sections.push(`Summary: ${resume.personalInfo.summary}`);
    }
    
    if (resume.experience.length > 0) {
      sections.push('EXPERIENCE:');
      resume.experience.forEach(exp => {
        sections.push(`${exp.position} at ${exp.company} (${exp.startDate} - ${exp.current ? 'Present' : exp.endDate})`);
        exp.description.forEach(desc => sections.push(`- ${desc}`));
        exp.achievements.forEach(achievement => sections.push(`- ${achievement}`));
      });
    }
    
    if (resume.education.length > 0) {
      sections.push('EDUCATION:');
      resume.education.forEach(edu => {
        sections.push(`${edu.degree} in ${edu.field} from ${edu.institution} (${edu.graduationDate})`);
      });
    }
    
    if (resume.skills.length > 0) {
      sections.push(`SKILLS: ${resume.skills.map(s => s.name).join(', ')}`);
    }
    
    if (resume.projects.length > 0) {
      sections.push('PROJECTS:');
      resume.projects.forEach(proj => {
        sections.push(`${proj.name}: ${proj.description}`);
        sections.push(`Technologies: ${proj.technologies.join(', ')}`);
      });
    }
    
    return sections.join('\n');
  }

  private getFallbackAdvice(userMessage: string, resume: Resume): string {
    const message = userMessage.toLowerCase();
    
    if (message.includes('summary') || message.includes('objective')) {
      return "Your professional summary should be 2-3 sentences highlighting your key strengths, years of experience, and value proposition. Include specific skills and quantifiable achievements when possible.";
    }
    
    if (message.includes('experience') || message.includes('work')) {
      return "Focus on achievements rather than responsibilities. Use action verbs and quantify your impact with numbers, percentages, or dollar amounts. Each bullet point should demonstrate value you brought to the organization.";
    }
    
    if (message.includes('skill')) {
      return "Include both technical and soft skills relevant to your target role. Organize them by category and consider adding proficiency levels. Make sure you can confidently discuss any skill you list.";
    }
    
    if (message.includes('keyword') || message.includes('ats')) {
      return "Review job descriptions for your target roles and incorporate relevant keywords naturally throughout your resume. Focus on skills, technologies, and industry terms that appear frequently.";
    }
    
    return "I'm here to help you improve your resume! Ask me about specific sections like your summary, experience descriptions, skills, or how to optimize for ATS systems.";
  }

  private getFallbackATSAnalysis(resume: Resume) {
    // Basic scoring logic as fallback
    let score = 60;
    
    if (resume.personalInfo.summary && resume.personalInfo.summary.length > 50) score += 10;
    if (resume.experience.length > 0) score += 15;
    if (resume.skills.length >= 5) score += 10;
    if (resume.education.length > 0) score += 5;
    
    return {
      score: Math.min(score, 100),
      analysis: "This is a basic analysis. For detailed AI-powered insights, please add your OpenAI API key to the environment variables.",
      suggestions: [
        "Add more relevant keywords from job descriptions",
        "Quantify your achievements with specific numbers",
        "Ensure all contact information is complete",
        "Include relevant technical skills",
        "Write a compelling professional summary"
      ],
      keywords: [
        "leadership", "management", "project management", "communication", "problem-solving",
        "teamwork", "analysis", "development", "implementation", "optimization"
      ]
    };
  }
}

export const openaiService = new OpenAIService();