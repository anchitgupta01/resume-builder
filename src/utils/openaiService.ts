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
            content: this.getResumeAdviceSystemPrompt()
          },
          {
            role: "user",
            content: `Resume Context:\n${resumeContext}\n\nUser Question: ${userMessage}`
          }
        ],
        max_tokens: 600,
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
      
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: this.getATSAnalysisSystemPrompt()
          },
          {
            role: "user",
            content: this.buildATSAnalysisPrompt(resumeText, jobDescription)
          }
        ],
        max_tokens: 1000,
        temperature: 0.3
      });

      const response = completion.choices[0]?.message?.content;
      if (response) {
        try {
          const parsed = JSON.parse(response);
          return {
            score: Math.max(0, Math.min(100, parsed.score || 0)),
            analysis: parsed.analysis || "Analysis completed",
            suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions.slice(0, 8) : [],
            keywords: Array.isArray(parsed.keywords) ? parsed.keywords.slice(0, 15) : []
          };
        } catch (parseError) {
          console.error('Failed to parse OpenAI response:', parseError);
        }
      }
    } catch (error) {
      console.error('OpenAI ATS analysis error:', error);
    }

    return this.getFallbackATSAnalysis(resume);
  }

  private getResumeAdviceSystemPrompt(): string {
    return `You are an expert resume consultant and career advisor with 15+ years of experience helping job seekers create compelling, ATS-optimized resumes.

EXPERTISE AREAS:
- Writing impactful professional summaries that grab attention
- Crafting achievement-focused experience descriptions with quantified results
- Optimizing resumes for Applicant Tracking Systems (ATS)
- Identifying industry-specific keywords and phrases
- Tailoring content for different career levels and industries

RESPONSE GUIDELINES:
1. Provide specific, actionable advice with concrete examples
2. Focus on measurable improvements and quantified achievements
3. Use industry best practices and current ATS optimization techniques
4. Keep responses concise but comprehensive (300-500 words max)
5. Include specific phrases or templates when helpful
6. Address the user's specific question while providing broader context

TONE: Professional, encouraging, and practical. Avoid generic advice - make it specific to their situation.`;
  }

  private getATSAnalysisSystemPrompt(): string {
    return `You are an expert ATS (Applicant Tracking System) analyzer with deep knowledge of how modern recruitment software processes and ranks resumes.

ANALYSIS FRAMEWORK:
You must evaluate resumes across these critical dimensions:

1. KEYWORD OPTIMIZATION (30% weight)
   - Industry-relevant keywords and phrases
   - Job-specific technical skills and tools
   - Action verbs and power words
   - Natural keyword integration (not stuffing)

2. FORMATTING & STRUCTURE (25% weight)
   - Clean, ATS-readable format
   - Proper section headers and hierarchy
   - Consistent formatting and spacing
   - Standard fonts and layouts

3. CONTENT QUALITY (25% weight)
   - Quantified achievements and results
   - Relevant work experience
   - Clear job progression and growth
   - Industry-appropriate content depth

4. COMPLETENESS (20% weight)
   - Essential contact information
   - Professional summary/objective
   - Complete work history with dates
   - Relevant education and certifications

SCORING METHODOLOGY:
- 90-100: Exceptional - Top 5% of resumes, highly optimized
- 80-89: Excellent - Strong ATS compatibility, minor improvements needed
- 70-79: Good - Solid foundation, some optimization required
- 60-69: Fair - Needs significant improvements for ATS success
- 50-59: Poor - Major issues that will hurt ATS ranking
- Below 50: Critical - Fundamental problems requiring complete revision

RESPONSE FORMAT:
Always respond with valid JSON in this exact structure:
{
  "score": [number between 0-100],
  "analysis": "[detailed 2-3 sentence analysis of strengths and key issues]",
  "suggestions": ["specific actionable improvement 1", "specific actionable improvement 2", ...],
  "keywords": ["relevant keyword 1", "relevant keyword 2", ...]
}

ANALYSIS EXAMPLES:

Example 1 - High Score (85):
{
  "score": 85,
  "analysis": "Strong resume with excellent keyword optimization and quantified achievements. Well-structured format that ATS systems can easily parse. Minor improvements needed in technical skills section and industry-specific terminology.",
  "suggestions": ["Add 2-3 more industry-specific technical skills", "Include metrics for team leadership achievements", "Optimize summary with target job title keywords"],
  "keywords": ["project management", "data analysis", "stakeholder engagement", "process improvement", "cross-functional collaboration"]
}

Example 2 - Medium Score (68):
{
  "score": 68,
  "analysis": "Decent foundation but lacks quantified achievements and industry keywords. Format is ATS-friendly but content needs strengthening with specific metrics and results-oriented language.",
  "suggestions": ["Quantify all achievements with numbers, percentages, or dollar amounts", "Add 5-7 relevant technical skills", "Rewrite experience bullets to focus on results rather than duties", "Include industry-specific keywords naturally throughout"],
  "keywords": ["leadership", "budget management", "customer satisfaction", "process optimization", "team development", "strategic planning"]
}

Example 3 - Low Score (45):
{
  "score": 45,
  "analysis": "Significant ATS optimization issues including lack of keywords, missing quantified achievements, and weak professional summary. Requires substantial revision to improve ATS compatibility and recruiter appeal.",
  "suggestions": ["Complete rewrite of professional summary with target keywords", "Add quantified achievements to every job role", "Include comprehensive skills section", "Optimize formatting for ATS readability", "Add relevant certifications and education details"],
  "keywords": ["communication", "problem-solving", "time management", "customer service", "teamwork", "attention to detail", "Microsoft Office", "data entry"]
}

CRITICAL INSTRUCTIONS:
- Always provide exactly 5-8 specific, actionable suggestions
- Include 8-15 relevant keywords based on the resume content and industry
- Ensure JSON is properly formatted and parseable
- Be specific about what needs improvement and how to fix it
- Consider both ATS technical requirements and human recruiter preferences`;
  }

  private buildATSAnalysisPrompt(resumeText: string, jobDescription?: string): string {
    let prompt = `Analyze this resume for ATS compatibility and optimization opportunities.

RESUME TO ANALYZE:
${resumeText}

`;

    if (jobDescription) {
      prompt += `TARGET JOB DESCRIPTION:
${jobDescription}

ADDITIONAL CONTEXT: This resume will be evaluated against the specific job requirements above. Pay special attention to matching keywords, required skills, and experience levels mentioned in the job description.

`;
    }

    prompt += `ANALYSIS REQUIREMENTS:
1. Evaluate against the 4 key ATS dimensions (keywords, formatting, content quality, completeness)
2. Provide an overall score (0-100) based on the scoring methodology
3. Give specific, actionable improvement suggestions
4. Identify relevant keywords that should be included
5. Consider both ATS technical parsing and human recruiter appeal

Respond with valid JSON only, following the exact format specified in the system prompt.`;

    return prompt;
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
        context.push(`- ${exp.position} at ${exp.company} (${exp.startDate} - ${exp.current ? 'Present' : exp.endDate})`);
        if (exp.achievements.length > 0) {
          context.push(`  Achievements: ${exp.achievements.slice(0, 2).join('; ')}`);
        }
      });
    }
    
    if (resume.skills.length > 0) {
      const skillsByCategory = resume.skills.reduce((acc, skill) => {
        if (!acc[skill.category]) acc[skill.category] = [];
        acc[skill.category].push(skill.name);
        return acc;
      }, {} as Record<string, string[]>);
      
      Object.entries(skillsByCategory).forEach(([category, skills]) => {
        context.push(`${category} Skills: ${skills.join(', ')}`);
      });
    }
    
    if (resume.education.length > 0) {
      context.push(`Education: ${resume.education.map(e => `${e.degree} in ${e.field} from ${e.institution}`).join('; ')}`);
    }
    
    if (resume.projects.length > 0) {
      context.push(`Projects: ${resume.projects.length} projects including ${resume.projects.map(p => p.name).join(', ')}`);
    }
    
    return context.join('\n');
  }

  private extractResumeText(resume: Resume): string {
    const sections = [];
    
    // Contact Information
    sections.push('=== CONTACT INFORMATION ===');
    sections.push(`Name: ${resume.personalInfo.fullName || 'Not provided'}`);
    sections.push(`Email: ${resume.personalInfo.email || 'Not provided'}`);
    sections.push(`Phone: ${resume.personalInfo.phone || 'Not provided'}`);
    sections.push(`Location: ${resume.personalInfo.location || 'Not provided'}`);
    
    if (resume.personalInfo.linkedin) sections.push(`LinkedIn: ${resume.personalInfo.linkedin}`);
    if (resume.personalInfo.github) sections.push(`GitHub: ${resume.personalInfo.github}`);
    if (resume.personalInfo.website) sections.push(`Website: ${resume.personalInfo.website}`);
    
    // Professional Summary
    if (resume.personalInfo.summary) {
      sections.push('\n=== PROFESSIONAL SUMMARY ===');
      sections.push(resume.personalInfo.summary);
    }
    
    // Work Experience
    if (resume.experience.length > 0) {
      sections.push('\n=== WORK EXPERIENCE ===');
      resume.experience.forEach((exp, index) => {
        sections.push(`\n${index + 1}. ${exp.position} at ${exp.company}`);
        sections.push(`   Duration: ${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}`);
        
        if (exp.description.length > 0) {
          sections.push('   Responsibilities:');
          exp.description.forEach(desc => sections.push(`   • ${desc}`));
        }
        
        if (exp.achievements.length > 0) {
          sections.push('   Key Achievements:');
          exp.achievements.forEach(achievement => sections.push(`   • ${achievement}`));
        }
      });
    }
    
    // Education
    if (resume.education.length > 0) {
      sections.push('\n=== EDUCATION ===');
      resume.education.forEach((edu, index) => {
        sections.push(`${index + 1}. ${edu.degree} in ${edu.field}`);
        sections.push(`   Institution: ${edu.institution}`);
        sections.push(`   Graduation: ${edu.graduationDate}`);
        if (edu.gpa) sections.push(`   GPA: ${edu.gpa}`);
        if (edu.honors && edu.honors.length > 0) {
          sections.push(`   Honors: ${edu.honors.join(', ')}`);
        }
      });
    }
    
    // Skills
    if (resume.skills.length > 0) {
      sections.push('\n=== SKILLS ===');
      const skillsByCategory = resume.skills.reduce((acc, skill) => {
        if (!acc[skill.category]) acc[skill.category] = [];
        acc[skill.category].push(`${skill.name} (${skill.proficiency})`);
        return acc;
      }, {} as Record<string, string[]>);
      
      Object.entries(skillsByCategory).forEach(([category, skills]) => {
        const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
        sections.push(`${categoryName}: ${skills.join(', ')}`);
      });
    }
    
    // Projects
    if (resume.projects.length > 0) {
      sections.push('\n=== PROJECTS ===');
      resume.projects.forEach((proj, index) => {
        sections.push(`\n${index + 1}. ${proj.name}`);
        sections.push(`   Description: ${proj.description}`);
        if (proj.technologies.length > 0) {
          sections.push(`   Technologies: ${proj.technologies.join(', ')}`);
        }
        if (proj.link) sections.push(`   Live Demo: ${proj.link}`);
        if (proj.github) sections.push(`   GitHub: ${proj.github}`);
      });
    }
    
    return sections.join('\n');
  }

  private getFallbackAdvice(userMessage: string, resume: Resume): string {
    const message = userMessage.toLowerCase();
    
    if (message.includes('summary') || message.includes('objective')) {
      return "Your professional summary should be 2-3 sentences highlighting your key strengths, years of experience, and value proposition. Start with your job title or expertise area, mention your years of experience, highlight 2-3 key skills or achievements, and end with what you're seeking or what value you bring. Example: 'Experienced Software Engineer with 5+ years developing scalable web applications using React and Node.js. Led cross-functional teams to deliver 15+ projects on time, improving system performance by 40%. Seeking to leverage full-stack expertise and leadership skills to drive innovation at a growth-stage technology company.'";
    }
    
    if (message.includes('experience') || message.includes('work') || message.includes('job')) {
      return "Transform your experience section by focusing on achievements rather than responsibilities. Use the STAR method (Situation, Task, Action, Result) and quantify everything possible. Instead of 'Managed social media accounts,' write 'Increased social media engagement by 150% over 6 months by developing and executing content strategy across 4 platforms, resulting in 2,000 new followers and 25% boost in website traffic.' Start each bullet with strong action verbs like 'Led,' 'Developed,' 'Implemented,' 'Optimized,' or 'Achieved.'";
    }
    
    if (message.includes('skill')) {
      return "Organize your skills strategically by relevance to your target role. Include both technical skills (programming languages, software, tools) and soft skills (leadership, communication, problem-solving). Add proficiency levels when relevant. For technical roles, prioritize hard skills; for management roles, balance technical and leadership skills. Ensure you can confidently discuss any skill you list in an interview. Consider adding certifications and specific versions/levels (e.g., 'Python 3.x,' 'Advanced Excel,' 'Fluent Spanish').";
    }
    
    if (message.includes('keyword') || message.includes('ats')) {
      return "To optimize for ATS systems, study 3-5 job descriptions for your target role and identify recurring keywords. Incorporate these naturally throughout your resume - in your summary, experience descriptions, and skills section. Focus on: job titles, required skills, industry terminology, software/tools, certifications, and soft skills mentioned. Avoid keyword stuffing; instead, weave them into achievement statements. For example, if 'project management' appears frequently, write 'Led project management initiatives for 5 cross-functional teams, delivering projects 20% ahead of schedule.'";
    }
    
    if (message.includes('format') || message.includes('layout')) {
      return "Use a clean, ATS-friendly format with standard section headers like 'Professional Experience,' 'Education,' and 'Skills.' Stick to common fonts (Arial, Calibri, Times New Roman), use consistent formatting, and avoid graphics, tables, or complex layouts. Keep it to 1-2 pages, use bullet points for easy scanning, and ensure proper spacing. Save as both PDF and Word formats. Your current format looks professional and should parse well through ATS systems.";
    }
    
    if (message.includes('project')) {
      return "Projects showcase your practical skills and initiative. Include personal coding projects, significant school assignments, volunteer work, freelance projects, or open-source contributions. For each project, describe: the problem you solved, technologies/skills used, your specific role, challenges overcome, and quantifiable results. Include live links and GitHub repositories when possible. Example: 'E-commerce Web App: Built full-stack application using React, Node.js, and MongoDB. Implemented user authentication, payment processing, and inventory management. Deployed on AWS with 99.9% uptime, supporting 500+ concurrent users.'";
    }
    
    return "I'm here to help you create an outstanding resume! I can assist with writing compelling summaries, crafting achievement-focused experience descriptions, optimizing for ATS systems, selecting relevant skills, and structuring your content effectively. What specific aspect would you like to improve? Feel free to ask about any section of your resume or share a particular challenge you're facing.";
  }

  private getFallbackATSAnalysis(resume: Resume) {
    // Enhanced fallback scoring logic
    let score = 50; // Base score
    
    // Contact information completeness (15 points max)
    if (resume.personalInfo.fullName) score += 3;
    if (resume.personalInfo.email) score += 3;
    if (resume.personalInfo.phone) score += 3;
    if (resume.personalInfo.location) score += 3;
    if (resume.personalInfo.linkedin || resume.personalInfo.github) score += 3;
    
    // Professional summary (10 points max)
    if (resume.personalInfo.summary) {
      if (resume.personalInfo.summary.length > 100) score += 10;
      else if (resume.personalInfo.summary.length > 50) score += 5;
    }
    
    // Experience section (20 points max)
    if (resume.experience.length > 0) {
      score += Math.min(resume.experience.length * 5, 15);
      
      // Check for quantified achievements
      const hasQuantifiedAchievements = resume.experience.some(exp =>
        exp.achievements.some(achievement =>
          /\d+/.test(achievement) || /%/.test(achievement) || /\$/.test(achievement)
        )
      );
      if (hasQuantifiedAchievements) score += 5;
    }
    
    // Skills section (10 points max)
    if (resume.skills.length >= 5) score += 5;
    if (resume.skills.length >= 10) score += 3;
    const hasVariedSkills = new Set(resume.skills.map(s => s.category)).size >= 2;
    if (hasVariedSkills) score += 2;
    
    // Education (5 points max)
    if (resume.education.length > 0) score += 5;
    
    // Projects (5 points max)
    if (resume.projects.length > 0) score += 3;
    if (resume.projects.length >= 2) score += 2;
    
    const finalScore = Math.min(score, 100);
    
    return {
      score: finalScore,
      analysis: `Basic analysis complete (Score: ${finalScore}/100). This resume ${finalScore >= 70 ? 'shows good potential' : 'needs improvement'} for ATS compatibility. For detailed AI-powered insights with specific keyword analysis and industry-tailored suggestions, please add your OpenAI API key to unlock advanced features.`,
      suggestions: [
        "Add quantified achievements with specific numbers and percentages",
        "Include more industry-relevant keywords from target job descriptions",
        "Expand technical skills section with current technologies",
        "Write a compelling professional summary highlighting key strengths",
        "Ensure all contact information is complete and professional",
        "Add relevant projects or certifications to strengthen your profile",
        "Use action verbs to start each experience bullet point",
        "Tailor content to match specific job requirements"
      ].slice(0, 5),
      keywords: [
        "leadership", "project management", "communication", "problem-solving", "teamwork",
        "data analysis", "process improvement", "customer service", "strategic planning", "collaboration",
        "time management", "attention to detail", "adaptability", "innovation", "results-driven"
      ]
    };
  }
}

export const openaiService = new OpenAIService();