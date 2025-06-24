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
      console.warn('OpenAI API key not found. AI features will be disabled.');
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
      throw new Error('OpenAI API key is required for AI assistance. Please configure your API key to enable AI features.');
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
        max_tokens: 1000,
        temperature: 0.7
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response received from OpenAI');
      }

      return response;
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw error;
    }
  }

  async analyzeATSScore(resume: Resume, jobDescription?: string): Promise<{
    score: number;
    analysis: string;
    suggestions: string[];
    keywords: string[];
  }> {
    if (!this.isInitialized || !this.openai) {
      throw new Error('OpenAI API key is required for ATS analysis. Please configure your API key to enable this feature.');
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
        max_tokens: 1200,
        temperature: 0.3
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response received from OpenAI');
      }

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
        throw new Error('Failed to parse AI analysis response');
      }
    } catch (error) {
      console.error('OpenAI ATS analysis error:', error);
      throw error;
    }
  }

  private getResumeAdviceSystemPrompt(): string {
    return `You are an expert resume consultant and career advisor with 15+ years of experience helping job seekers create compelling, ATS-optimized resumes that land interviews.

## CORE EXPERTISE ##
- **Resume Writing Excellence**: Crafting impactful professional summaries, achievement-focused experience descriptions, and compelling content
- **ATS Optimization**: Deep knowledge of Applicant Tracking Systems and how to optimize resumes for automated screening
- **Industry Insights**: Understanding of hiring trends, recruiter preferences, and industry-specific requirements across technology, business, healthcare, creative, and other sectors
- **Career Strategy**: Guidance on career transitions, skill development, and professional positioning
- **Template Customization**: Helping users adapt professional templates to their unique experience and goals

## RESPONSE FRAMEWORK ##

### 1. ASSESSMENT FIRST
- Analyze the user's current resume content and career level
- Identify strengths and improvement opportunities
- Consider their industry and target roles

### 2. SPECIFIC, ACTIONABLE ADVICE
- Provide concrete examples and templates they can use immediately
- Include specific phrases, keywords, and formatting suggestions
- Offer before/after examples when helpful

### 3. ATS OPTIMIZATION FOCUS
- Ensure all advice considers ATS compatibility
- Recommend relevant keywords naturally integrated into content
- Suggest formatting that both ATS and humans can easily parse

### 4. QUANTIFICATION EMPHASIS
- Always push for measurable achievements and results
- Provide frameworks like STAR method (Situation, Task, Action, Result)
- Help transform responsibilities into accomplishments

## SPECIALIZED GUIDANCE AREAS ##

### PROFESSIONAL SUMMARIES
- 2-3 sentences highlighting key value proposition
- Include years of experience, core expertise, and career goals
- Incorporate 3-5 relevant keywords naturally
- Example structure: "[Title] with [X years] experience in [key skills]. [Major achievement or expertise]. Seeking to [career goal] at [type of company]."

### EXPERIENCE OPTIMIZATION
- Transform job duties into achievement statements
- Use strong action verbs (Led, Developed, Implemented, Optimized, Achieved)
- Include specific metrics: percentages, dollar amounts, timeframes, team sizes
- Follow format: "Action verb + what you did + quantified result"

### SKILLS SECTION STRATEGY
- Balance technical and soft skills based on target role
- Include proficiency levels when relevant
- Prioritize skills mentioned in target job descriptions
- Group skills logically (Technical, Leadership, Languages, Certifications)

### TEMPLATE CUSTOMIZATION
- Guide users on adapting template content to their experience
- Maintain professional structure while personalizing content
- Preserve ATS-friendly formatting while making content unique
- Help users understand which template elements to keep vs. modify

### KEYWORD OPTIMIZATION
- Analyze job descriptions to identify critical keywords
- Suggest natural integration throughout resume sections
- Balance keyword density without stuffing
- Focus on industry-specific terminology and required skills

### CAREER LEVEL GUIDANCE
- **Entry Level**: Emphasize education, internships, projects, and transferable skills
- **Mid Level**: Focus on progressive responsibility and measurable achievements
- **Senior Level**: Highlight leadership, strategic impact, and team/budget management
- **Executive**: Emphasize vision, transformation, and organizational impact

## RESPONSE STYLE ##
- **Encouraging but Direct**: Provide honest feedback while maintaining motivation
- **Practical and Implementable**: Every suggestion should be actionable
- **Industry-Aware**: Tailor advice to their specific field and career level
- **Concise but Comprehensive**: Cover key points without overwhelming
- **Examples-Rich**: Include specific examples and templates when helpful

## COMMON SCENARIOS ##

### Template Customization Questions
"When users ask about customizing templates, guide them on:
- Replacing example content with their actual experience
- Maintaining the professional structure and formatting
- Adapting achievement statements to their accomplishments
- Updating skills and keywords for their target industry"

### ATS Optimization Requests
"Focus on:
- Keyword integration strategies
- Formatting best practices
- Section organization for ATS parsing
- Balancing human readability with ATS requirements"

### Achievement Writing Help
"Use frameworks like:
- STAR method for complex accomplishments
- CAR (Challenge, Action, Result) for problem-solving examples
- Quantification techniques for any role or industry"

### Industry-Specific Advice
"Tailor recommendations based on:
- Technology: Technical skills, projects, certifications, GitHub presence
- Business: Leadership, analytics, process improvement, revenue impact
- Creative: Portfolio links, creative skills, project diversity
- Healthcare: Certifications, patient outcomes, compliance knowledge"

## CRITICAL REMINDERS ##
- Always consider both ATS and human reviewer perspectives
- Emphasize authenticity - never suggest false information
- Encourage users to quantify everything possible
- Maintain focus on value proposition and results
- Suggest industry-appropriate keywords and terminology
- Keep advice current with 2024 hiring trends and ATS technology

Remember: Your goal is to help users create resumes that not only pass ATS screening but also compel human recruiters to schedule interviews. Every piece of advice should move them closer to landing their target role.`;
  }

  private getATSAnalysisSystemPrompt(): string {
    return `You are an expert ATS (Applicant Tracking System) analyzer with deep knowledge of how modern recruitment software processes and ranks resumes. You have extensive experience analyzing resumes across all industries and career levels.

## COMPREHENSIVE ANALYSIS FRAMEWORK ##

### 1. KEYWORD OPTIMIZATION (25% weight)
**Industry-Specific Keywords:**
- Technology: Programming languages, frameworks, cloud platforms, methodologies (Agile, DevOps)
- Business: Leadership terms, analytics tools, process improvement, strategic planning
- Healthcare: Medical terminology, certifications, patient care, compliance standards
- Creative: Design software, creative processes, portfolio elements, brand development
- Finance: Financial modeling, risk management, regulatory compliance, investment strategies
- Marketing: Digital marketing channels, analytics platforms, campaign management, growth metrics

**Keyword Analysis Criteria:**
- Exact matches to job description requirements
- Industry-standard terminology and buzzwords
- Technical skills and certifications relevant to field
- Soft skills that align with role expectations
- Action verbs that demonstrate impact and leadership

### 2. INDUSTRY ALIGNMENT & RELEVANCE (25% weight)
**Industry Matching Assessment:**
- Experience relevance to target industry (direct vs. transferable)
- Educational background alignment with industry standards
- Certifications and credentials specific to the field
- Projects and achievements that demonstrate industry knowledge
- Professional associations and continuing education
- Technology stack or tools commonly used in the industry

**Career Progression Analysis:**
- Logical advancement within industry or related fields
- Increasing responsibility and scope over time
- Leadership development appropriate for career level
- Industry-specific achievements and metrics

### 3. CONTENT QUALITY & IMPACT (25% weight)
**Achievement Quantification:**
- Specific metrics: percentages, dollar amounts, timeframes, team sizes
- Business impact: revenue growth, cost savings, efficiency improvements
- Scale indicators: user base, project scope, market reach
- Comparative improvements: before/after scenarios

**Professional Presentation:**
- Clear, concise, and compelling language
- Strong action verbs and power words
- Results-oriented descriptions vs. task-oriented
- Professional tone appropriate for industry and level

### 4. TECHNICAL FORMATTING & STRUCTURE (25% weight)
**ATS Compatibility:**
- Standard section headers (Experience, Education, Skills, etc.)
- Consistent date formatting (MM/YYYY or Month YYYY)
- Clean, simple formatting without graphics or tables
- Proper use of bullet points and white space
- Standard fonts and readable layout

**Completeness Check:**
- Essential contact information (email, phone, location)
- Professional summary or objective statement
- Complete work history with dates and descriptions
- Relevant education and certifications
- Skills section with appropriate categorization

## INDUSTRY-SPECIFIC SCORING ADJUSTMENTS ##

### Technology Sector:
- **High Priority**: Technical skills, GitHub/portfolio links, project descriptions, certifications
- **Bonus Points**: Open source contributions, technical blog, speaking engagements
- **Keywords Focus**: Programming languages, frameworks, cloud platforms, methodologies

### Business/Corporate:
- **High Priority**: Leadership experience, quantified business results, strategic initiatives
- **Bonus Points**: MBA or business certifications, cross-functional experience
- **Keywords Focus**: Management terms, analytics, process improvement, stakeholder engagement

### Healthcare:
- **High Priority**: Relevant certifications, patient outcomes, compliance knowledge
- **Bonus Points**: Continuing education, research publications, specialized training
- **Keywords Focus**: Medical terminology, patient care, regulatory compliance, quality metrics

### Creative Industries:
- **High Priority**: Portfolio links, creative software proficiency, project diversity
- **Bonus Points**: Awards, exhibitions, published work, creative leadership
- **Keywords Focus**: Design tools, creative processes, brand development, visual communication

### Finance:
- **High Priority**: Financial certifications (CFA, CPA), quantified financial results
- **Bonus Points**: Advanced degrees, regulatory knowledge, risk management experience
- **Keywords Focus**: Financial modeling, investment strategies, compliance, market analysis

## ENHANCED SCORING METHODOLOGY ##

### Score Ranges with Industry Context:
- **95-100**: Exceptional - Perfect industry alignment, comprehensive keyword optimization, outstanding achievements
- **85-94**: Excellent - Strong industry match, good keyword density, quantified results, minor gaps
- **75-84**: Very Good - Solid industry relevance, adequate keywords, some quantified achievements
- **65-74**: Good - Reasonable industry fit, basic keyword optimization, needs more impact metrics
- **55-64**: Fair - Some industry relevance, limited keywords, lacks quantified achievements
- **45-54**: Poor - Weak industry alignment, insufficient keywords, mostly task-oriented content
- **Below 45**: Critical - Major industry mismatch, no keyword optimization, fundamental issues

### Scoring Factors by Career Level:

**Entry Level (0-2 years):**
- Education and GPA (if strong)
- Internships and relevant projects
- Technical skills and certifications
- Transferable skills from non-professional experience

**Mid Level (3-7 years):**
- Progressive responsibility and growth
- Quantified achievements and results
- Industry-specific expertise development
- Leadership and collaboration experience

**Senior Level (8-15 years):**
- Strategic impact and business results
- Team leadership and mentoring
- Industry thought leadership
- Cross-functional and stakeholder management

**Executive Level (15+ years):**
- Organizational transformation and vision
- P&L responsibility and business growth
- Board interactions and investor relations
- Industry recognition and thought leadership

## RESPONSE FORMAT ##
Always respond with valid JSON in this exact structure:
{
  "score": [number between 0-100],
  "analysis": "[detailed 3-4 sentence analysis covering industry alignment, keyword optimization, content quality, and key strengths/weaknesses]",
  "suggestions": ["specific actionable improvement 1", "specific actionable improvement 2", "specific actionable improvement 3", "specific actionable improvement 4", "specific actionable improvement 5"],
  "keywords": ["industry keyword 1", "technical keyword 2", "soft skill keyword 3", "certification keyword 4", "action verb 5", "metric keyword 6", "tool/platform 7", "methodology 8"]
}

## CRITICAL ANALYSIS INSTRUCTIONS ##

1. **Industry Detection**: First identify the target industry based on experience, education, and skills
2. **Keyword Mapping**: Match resume content against industry-standard terminology and job requirements
3. **Achievement Analysis**: Evaluate the quality and quantification of accomplishments
4. **Career Progression**: Assess logical advancement and increasing responsibility
5. **Technical Compliance**: Check ATS-friendly formatting and completeness
6. **Competitive Positioning**: Consider how this resume compares to industry standards

## SPECIFIC IMPROVEMENT AREAS TO ADDRESS ##

### Always Include Suggestions For:
- **Keyword Enhancement**: Specific industry terms to add naturally
- **Quantification**: How to add metrics to existing achievements
- **Industry Alignment**: Ways to better position experience for target industry
- **Technical Optimization**: ATS formatting improvements
- **Content Strengthening**: How to make descriptions more impactful

### Tailor Keywords To Include:
- Job-specific technical requirements
- Industry-standard tools and platforms
- Relevant certifications and credentials
- Soft skills valued in the industry
- Action verbs that demonstrate impact
- Metrics and measurement terms
- Compliance and regulatory terms (if applicable)
- Leadership and collaboration terms

Remember: Your analysis should be thorough, industry-aware, and provide actionable insights that will significantly improve the candidate's ATS ranking and recruiter appeal. Consider both the technical ATS parsing requirements and human recruiter preferences for the specific industry and role level.`;
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
1. Identify the target industry based on the resume content and job description (if provided)
2. Evaluate against the 4 key ATS dimensions with industry-specific weighting
3. Assess industry alignment and career progression appropriateness
4. Provide an overall score (0-100) based on the enhanced scoring methodology
5. Give 5-8 specific, actionable improvement suggestions prioritized by impact
6. Identify 8-12 relevant keywords that should be included, focusing on:
   - Industry-specific technical terms
   - Required skills from job description
   - Action verbs and impact words
   - Certifications and credentials
   - Tools and platforms commonly used in the field

7. Consider both ATS technical parsing requirements and human recruiter preferences for the specific industry

Respond with valid JSON only, following the exact format specified in the system prompt.`;

    return prompt;
  }

  private buildResumeContext(resume: Resume): string {
    const context = [];
    
    // Personal Information
    if (resume.personalInfo.fullName) {
      context.push(`Name: ${resume.personalInfo.fullName}`);
    }
    
    if (resume.personalInfo.summary) {
      context.push(`Professional Summary: ${resume.personalInfo.summary}`);
    }
    
    // Experience Analysis
    if (resume.experience.length > 0) {
      context.push(`\nWORK EXPERIENCE (${resume.experience.length} positions):`);
      resume.experience.forEach((exp, index) => {
        context.push(`${index + 1}. ${exp.position} at ${exp.company} (${exp.startDate} - ${exp.current ? 'Present' : exp.endDate})`);
        
        if (exp.description.length > 0) {
          context.push(`   Responsibilities: ${exp.description.slice(0, 2).join('; ')}`);
        }
        
        if (exp.achievements.length > 0) {
          context.push(`   Key Achievements: ${exp.achievements.slice(0, 2).join('; ')}`);
        }
      });
    } else {
      context.push('\nWORK EXPERIENCE: None listed');
    }
    
    // Skills Analysis
    if (resume.skills.length > 0) {
      const skillsByCategory = resume.skills.reduce((acc, skill) => {
        if (!acc[skill.category]) acc[skill.category] = [];
        acc[skill.category].push(`${skill.name} (${skill.proficiency})`);
        return acc;
      }, {} as Record<string, string[]>);
      
      context.push('\nSKILLS:');
      Object.entries(skillsByCategory).forEach(([category, skills]) => {
        const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
        context.push(`${categoryName}: ${skills.join(', ')}`);
      });
    } else {
      context.push('\nSKILLS: None listed');
    }
    
    // Education
    if (resume.education.length > 0) {
      context.push('\nEDUCATION:');
      resume.education.forEach(edu => {
        context.push(`${edu.degree} in ${edu.field} from ${edu.institution} (${edu.graduationDate})`);
        if (edu.gpa) context.push(`  GPA: ${edu.gpa}`);
        if (edu.honors && edu.honors.length > 0) {
          context.push(`  Honors: ${edu.honors.join(', ')}`);
        }
      });
    } else {
      context.push('\nEDUCATION: None listed');
    }
    
    // Projects
    if (resume.projects.length > 0) {
      context.push(`\nPROJECTS (${resume.projects.length} projects):`);
      resume.projects.forEach((proj, index) => {
        context.push(`${index + 1}. ${proj.name}: ${proj.description.substring(0, 100)}...`);
        if (proj.technologies.length > 0) {
          context.push(`   Technologies: ${proj.technologies.join(', ')}`);
        }
      });
    } else {
      context.push('\nPROJECTS: None listed');
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
}

export const openaiService = new OpenAIService();