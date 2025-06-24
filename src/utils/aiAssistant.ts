import OpenAI from 'openai';

export class AIAssistant {
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

  async generateResponse(prompt: string): Promise<string> {
    if (!this.openai) {
      throw new Error('OpenAI API key is required for AI assistance. Please configure your API key to enable AI features.');
    }

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI assistant specializing in resume building and career advice. Provide concise, actionable advice.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      });

      return completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new Error('Failed to generate AI response. Please try again.');
    }
  }

  async improveResumeSection(section: string, content: string): Promise<string> {
    const prompt = `Please improve this ${section} section of a resume. Make it more professional, impactful, and ATS-friendly:

${content}

Provide only the improved version without explanations.`;

    return this.generateResponse(prompt);
  }

  async generateJobMatchAnalysis(resumeData: any, jobDescription: string): Promise<string> {
    const prompt = `Analyze how well this resume matches the job description and provide improvement suggestions:

Job Description:
${jobDescription}

Resume Summary:
- Experience: ${resumeData.experience?.map((exp: any) => `${exp.position} at ${exp.company}`).join(', ') || 'None listed'}
- Skills: ${resumeData.skills?.join(', ') || 'None listed'}
- Education: ${resumeData.education?.map((edu: any) => `${edu.degree} from ${edu.school}`).join(', ') || 'None listed'}

Provide a match score (0-100%) and specific recommendations for improvement.`;

    return this.generateResponse(prompt);
  }
}

export const aiAssistant = new AIAssistant();