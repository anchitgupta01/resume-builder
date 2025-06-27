import OpenAI from 'openai';
import { Resume, ATSScore } from '../types/resume';

class OpenAIService {
  private openai: OpenAI | null = null;

  constructor() {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    if (apiKey && apiKey.trim() !== '') {
      this.openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true
      });
    }
  }

  private isConfigured(): boolean {
    return this.openai !== null;
  }

  async generateResumeAdvice(question: string, resume: Resume): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('OpenAI API key is required for AI assistance. Please configure your API key to enable AI features.');
    }

    try {
      const resumeContext = this.formatResumeForContext(resume);
      
      const completion = await this.openai!.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a professional resume advisor and career coach. You help people improve their resumes to be more effective and ATS-friendly. 

Provide specific, actionable advice based on the user's current resume content. Focus on:
- Improving content quality and impact
- ATS optimization
- Professional formatting suggestions
- Industry best practices
- Quantifying achievements
- Using strong action verbs

Be encouraging but honest about areas for improvement. Provide concrete examples when possible.`
          },
          {
            role: 'user',
            content: `Here's my current resume information:

${resumeContext}

Question: ${question}`
          }
        ],
        max_tokens: 800,
        temperature: 0.7
      });

      return completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
    } catch (error) {
      console.error('OpenAI API Error:', error);
      if (error instanceof Error && error.message.includes('API key')) {
        throw new Error('Invalid OpenAI API key. Please check your configuration.');
      }
      throw new Error('Failed to generate AI response. Please try again.');
    }
  }

  async fixResumeForATS(resume: Resume): Promise<{
    improvedResume: Resume;
    improvements: string[];
    expectedScoreIncrease: number;
  }> {
    if (!this.isConfigured()) {
      throw new Error('OpenAI API key is required for AI-powered resume fixing. Please configure your API key to enable this feature.');
    }

    try {
      const resumeContext = this.formatResumeForContext(resume);
      
      const completion = await this.openai!.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are an expert resume optimizer specializing in ATS (Applicant Tracking System) optimization. Your task is to improve resumes to increase their ATS compatibility and overall effectiveness.

CRITICAL: You must return a valid JSON object with the following structure:
{
  "improvedResume": {
    "personalInfo": {
      "fullName": "string",
      "email": "string", 
      "phone": "string",
      "location": "string",
      "linkedin": "string",
      "github": "string", 
      "website": "string",
      "summary": "string"
    },
    "experience": [
      {
        "id": "string",
        "company": "string",
        "position": "string", 
        "startDate": "string",
        "endDate": "string",
        "current": boolean,
        "description": ["string"],
        "achievements": ["string"]
      }
    ],
    "education": [
      {
        "id": "string",
        "institution": "string",
        "degree": "string",
        "field": "string", 
        "graduationDate": "string",
        "gpa": "string",
        "honors": ["string"]
      }
    ],
    "skills": [
      {
        "id": "string",
        "name": "string",
        "category": "technical|soft|language|certification",
        "proficiency": "beginner|intermediate|advanced|expert"
      }
    ],
    "projects": [
      {
        "id": "string",
        "name": "string",
        "description": "string",
        "technologies": ["string"],
        "link": "string",
        "github": "string"
      }
    ]
  },
  "improvements": ["string"],
  "expectedScoreIncrease": number
}

Focus on:
- Enhancing professional summary with keywords and impact
- Improving experience descriptions with action verbs and quantified achievements
- Optimizing skills for ATS scanning
- Ensuring consistent formatting and professional language
- Adding relevant keywords for the person's field
- Improving project descriptions to highlight technical skills and business impact

Keep all existing personal contact information unchanged. Only improve content quality, not personal details.`
          },
          {
            role: 'user',
            content: `Please optimize this resume for ATS compatibility and overall effectiveness:

${resumeContext}

Return only the JSON object with the improved resume data, list of improvements made, and expected ATS score increase (0-30 points).`
          }
        ],
        max_tokens: 2000,
        temperature: 0.3
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from AI service');
      }

      try {
        const result = JSON.parse(response);
        
        // Validate the response structure
        if (!result.improvedResume || !result.improvements || typeof result.expectedScoreIncrease !== 'number') {
          throw new Error('Invalid response structure from AI');
        }

        // Ensure IDs are preserved or generated
        if (result.improvedResume.experience) {
          result.improvedResume.experience = result.improvedResume.experience.map((exp: any, index: number) => ({
            ...exp,
            id: exp.id || `exp_${Date.now()}_${index}`
          }));
        }

        if (result.improvedResume.education) {
          result.improvedResume.education = result.improvedResume.education.map((edu: any, index: number) => ({
            ...edu,
            id: edu.id || `edu_${Date.now()}_${index}`
          }));
        }

        if (result.improvedResume.skills) {
          result.improvedResume.skills = result.improvedResume.skills.map((skill: any, index: number) => ({
            ...skill,
            id: skill.id || `skill_${Date.now()}_${index}`
          }));
        }

        if (result.improvedResume.projects) {
          result.improvedResume.projects = result.improvedResume.projects.map((project: any, index: number) => ({
            ...project,
            id: project.id || `project_${Date.now()}_${index}`
          }));
        }

        return {
          improvedResume: result.improvedResume,
          improvements: result.improvements,
          expectedScoreIncrease: Math.min(Math.max(result.expectedScoreIncrease, 0), 30)
        };
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        console.error('Raw response:', response);
        throw new Error('Failed to parse AI response. Please try again.');
      }
    } catch (error) {
      console.error('OpenAI API Error:', error);
      if (error instanceof Error && error.message.includes('API key')) {
        throw new Error('Invalid OpenAI API key. Please check your configuration.');
      }
      throw error;
    }
  }

  async analyzeATSScore(resume: Resume, jobDescription?: string): Promise<{
    score: number;
    keywords: string[];
    suggestions: string[];
  }> {
    if (!this.isConfigured()) {
      throw new Error('OpenAI API key is required for AI-powered ATS analysis. Please configure your API key to enable this feature.');
    }

    try {
      const resumeContext = this.formatResumeForContext(resume);
      const jobContext = jobDescription ? `\n\nJob Description:\n${jobDescription}` : '';
      
      const completion = await this.openai!.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are an ATS (Applicant Tracking System) analyzer. Analyze resumes for ATS compatibility and provide scores and recommendations.

Return a JSON object with this exact structure:
{
  "score": number (0-100),
  "keywords": ["keyword1", "keyword2", ...],
  "suggestions": ["suggestion1", "suggestion2", ...]
}

Consider:
- Keyword optimization
- Formatting compatibility
- Section organization
- Industry-relevant terms
- Action verbs and quantified achievements
- Skills alignment with job requirements (if provided)`
          },
          {
            role: 'user',
            content: `Analyze this resume for ATS compatibility:

${resumeContext}${jobContext}

Provide an ATS score (0-100), relevant keywords that should be included, and specific suggestions for improvement.`
          }
        ],
        max_tokens: 600,
        temperature: 0.3
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from AI service');
      }

      try {
        const result = JSON.parse(response);
        return {
          score: Math.min(Math.max(result.score || 0, 0), 100),
          keywords: result.keywords || [],
          suggestions: result.suggestions || []
        };
      } catch (parseError) {
        console.error('Failed to parse ATS analysis response:', parseError);
        throw new Error('Failed to parse AI analysis. Please try again.');
      }
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw error;
    }
  }

  async parseResumeText(extractedText: string): Promise<Resume> {
    if (!this.isConfigured()) {
      throw new Error('OpenAI API key is required for PDF parsing. Please configure your API key to enable this feature.');
    }

    try {
      const completion = await this.openai!.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a resume parser. Extract structured data from resume text and return it as JSON.

Return a JSON object with this exact structure:
{
  "personalInfo": {
    "fullName": "string",
    "email": "string",
    "phone": "string", 
    "location": "string",
    "linkedin": "string",
    "github": "string",
    "website": "string",
    "summary": "string"
  },
  "experience": [
    {
      "id": "string",
      "company": "string",
      "position": "string",
      "startDate": "string",
      "endDate": "string", 
      "current": boolean,
      "description": ["string"],
      "achievements": ["string"]
    }
  ],
  "education": [
    {
      "id": "string",
      "institution": "string",
      "degree": "string",
      "field": "string",
      "graduationDate": "string",
      "gpa": "string",
      "honors": ["string"]
    }
  ],
  "skills": [
    {
      "id": "string", 
      "name": "string",
      "category": "technical|soft|language|certification",
      "proficiency": "beginner|intermediate|advanced|expert"
    }
  ],
  "projects": [
    {
      "id": "string",
      "name": "string", 
      "description": "string",
      "technologies": ["string"],
      "link": "string",
      "github": "string"
    }
  ]
}

Extract all available information. Use empty strings for missing data, not null.`
          },
          {
            role: 'user',
            content: `Parse this resume text into structured JSON:

${extractedText}`
          }
        ],
        max_tokens: 1500,
        temperature: 0.1
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from AI service');
      }

      try {
        const result = JSON.parse(response);
        
        // Generate IDs if missing
        if (result.experience) {
          result.experience = result.experience.map((exp: any, index: number) => ({
            ...exp,
            id: exp.id || `exp_${Date.now()}_${index}`
          }));
        }

        if (result.education) {
          result.education = result.education.map((edu: any, index: number) => ({
            ...edu,
            id: edu.id || `edu_${Date.now()}_${index}`
          }));
        }

        if (result.skills) {
          result.skills = result.skills.map((skill: any, index: number) => ({
            ...skill,
            id: skill.id || `skill_${Date.now()}_${index}`
          }));
        }

        if (result.projects) {
          result.projects = result.projects.map((project: any, index: number) => ({
            ...project,
            id: project.id || `project_${Date.now()}_${index}`
          }));
        }

        return result;
      } catch (parseError) {
        console.error('Failed to parse resume data:', parseError);
        throw new Error('Failed to parse resume content. Please try again.');
      }
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw error;
    }
  }

  private formatResumeForContext(resume: Resume): string {
    const sections = [];

    // Personal Info
    if (resume.personalInfo.fullName || resume.personalInfo.email) {
      sections.push(`PERSONAL INFORMATION:
Name: ${resume.personalInfo.fullName || 'Not provided'}
Email: ${resume.personalInfo.email || 'Not provided'}
Phone: ${resume.personalInfo.phone || 'Not provided'}
Location: ${resume.personalInfo.location || 'Not provided'}
LinkedIn: ${resume.personalInfo.linkedin || 'Not provided'}
GitHub: ${resume.personalInfo.github || 'Not provided'}
Website: ${resume.personalInfo.website || 'Not provided'}
Summary: ${resume.personalInfo.summary || 'Not provided'}`);
    }

    // Experience
    if (resume.experience.length > 0) {
      const expText = resume.experience.map(exp => 
        `${exp.position} at ${exp.company} (${exp.startDate} - ${exp.current ? 'Present' : exp.endDate})
Responsibilities: ${exp.description.join('; ')}
Achievements: ${exp.achievements.join('; ')}`
      ).join('\n\n');
      sections.push(`WORK EXPERIENCE:\n${expText}`);
    }

    // Education
    if (resume.education.length > 0) {
      const eduText = resume.education.map(edu =>
        `${edu.degree} in ${edu.field} from ${edu.institution} (${edu.graduationDate})
GPA: ${edu.gpa || 'Not provided'}
Honors: ${edu.honors?.join(', ') || 'None'}`
      ).join('\n\n');
      sections.push(`EDUCATION:\n${eduText}`);
    }

    // Skills
    if (resume.skills.length > 0) {
      const skillsByCategory = resume.skills.reduce((acc, skill) => {
        if (!acc[skill.category]) acc[skill.category] = [];
        acc[skill.category].push(`${skill.name} (${skill.proficiency})`);
        return acc;
      }, {} as Record<string, string[]>);

      const skillsText = Object.entries(skillsByCategory)
        .map(([category, skills]) => `${category}: ${skills.join(', ')}`)
        .join('\n');
      sections.push(`SKILLS:\n${skillsText}`);
    }

    // Projects
    if (resume.projects.length > 0) {
      const projectsText = resume.projects.map(project =>
        `${project.name}: ${project.description}
Technologies: ${project.technologies.join(', ')}
Links: ${project.link || 'None'} | ${project.github || 'None'}`
      ).join('\n\n');
      sections.push(`PROJECTS:\n${projectsText}`);
    }

    return sections.join('\n\n') || 'No resume content provided.';
  }
}

export const openaiService = new OpenAIService();