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

  async fixResumeForATS(resume: Resume, jobDescription?: string): Promise<{
    improvedResume: Resume;
    improvements: string[];
    expectedScoreIncrease: number;
  }> {
    if (!this.isInitialized || !this.openai) {
      throw new Error('OpenAI API key is required for resume fixing. Please configure your API key to enable this feature.');
    }

    try {
      const resumeText = this.extractResumeText(resume);
      
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: this.getResumeFixingSystemPrompt()
          },
          {
            role: "user",
            content: this.buildResumeFixingPrompt(resumeText, jobDescription)
          }
        ],
        max_tokens: 2000,
        temperature: 0.3
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response received from OpenAI');
      }

      try {
        const parsed = JSON.parse(response);
        
        // Apply the improvements to the resume
        const improvedResume = this.applyImprovements(resume, parsed.improvements);
        
        return {
          improvedResume,
          improvements: parsed.changesApplied || [],
          expectedScoreIncrease: parsed.expectedScoreIncrease || 0
        };
      } catch (parseError) {
        console.error('Failed to parse resume fixing response:', parseError);
        throw new Error('Failed to parse AI resume improvements');
      }
    } catch (error) {
      console.error('OpenAI resume fixing error:', error);
      throw error;
    }
  }

  private applyImprovements(originalResume: Resume, improvements: any): Resume {
    const improvedResume = JSON.parse(JSON.stringify(originalResume)); // Deep clone
    
    // Apply professional summary improvements
    if (improvements.professionalSummary) {
      improvedResume.personalInfo.summary = improvements.professionalSummary;
    }
    
    // Apply experience improvements
    if (improvements.experience && Array.isArray(improvements.experience)) {
      improvements.experience.forEach((expImprovement: any, index: number) => {
        if (improvedResume.experience[index]) {
          if (expImprovement.description) {
            improvedResume.experience[index].description = expImprovement.description;
          }
          if (expImprovement.achievements) {
            improvedResume.experience[index].achievements = expImprovement.achievements;
          }
        }
      });
    }
    
    // Apply skills improvements
    if (improvements.skills && Array.isArray(improvements.skills)) {
      // Add new skills while preserving existing ones
      const existingSkillNames = improvedResume.skills.map(skill => skill.name.toLowerCase());
      improvements.skills.forEach((newSkill: any) => {
        if (!existingSkillNames.includes(newSkill.name.toLowerCase())) {
          improvedResume.skills.push({
            id: Date.now().toString() + Math.random(),
            name: newSkill.name,
            category: newSkill.category || 'technical',
            proficiency: newSkill.proficiency || 'intermediate'
          });
        }
      });
    }
    
    // Apply project improvements
    if (improvements.projects && Array.isArray(improvements.projects)) {
      improvements.projects.forEach((projImprovement: any, index: number) => {
        if (improvedResume.projects[index]) {
          if (projImprovement.description) {
            improvedResume.projects[index].description = projImprovement.description;
          }
          if (projImprovement.technologies) {
            improvedResume.projects[index].technologies = projImprovement.technologies;
          }
        }
      });
    }
    
    return improvedResume;
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

  private getResumeFixingSystemPrompt(): string {
    return `You are an expert resume optimization specialist with the ability to automatically improve resumes to increase their ATS (Applicant Tracking System) compatibility and overall effectiveness.

## YOUR MISSION ##
When a user asks you to "fix" or "improve" their resume, you will:
1. Analyze the current resume for ATS optimization opportunities
2. Identify specific areas that need improvement
3. Generate improved content that increases ATS score and recruiter appeal
4. Provide concrete, implementable improvements

## IMPROVEMENT AREAS TO FOCUS ON ##

### 1. PROFESSIONAL SUMMARY OPTIMIZATION
- Rewrite to include 3-5 relevant keywords naturally
- Ensure 2-3 sentences highlighting key value proposition
- Include years of experience and core expertise
- Add career goals or target role alignment
- Make it compelling and ATS-friendly

### 2. EXPERIENCE SECTION ENHANCEMENT
- Transform responsibilities into achievement-focused statements
- Add quantified metrics (percentages, dollar amounts, timeframes)
- Use strong action verbs (Led, Developed, Implemented, Optimized)
- Include industry-relevant keywords naturally
- Follow format: "Action verb + what you did + quantified result"

### 3. SKILLS OPTIMIZATION
- Add missing industry-relevant technical skills
- Include tools and platforms commonly required
- Balance technical and soft skills appropriately
- Ensure skills match job description requirements
- Organize skills by category and relevance

### 4. KEYWORD INTEGRATION
- Identify missing keywords from job description
- Integrate keywords naturally throughout all sections
- Focus on industry-specific terminology
- Include required certifications and qualifications
- Balance keyword density without stuffing

### 5. PROJECT DESCRIPTIONS
- Enhance project descriptions with technical details
- Add quantified outcomes and impact
- Include relevant technologies and methodologies
- Highlight problem-solving and innovation
- Connect projects to career goals

## RESPONSE FORMAT ##
Always respond with valid JSON in this exact structure:
{
  "improvements": {
    "professionalSummary": "improved summary text",
    "experience": [
      {
        "description": ["improved responsibility 1", "improved responsibility 2"],
        "achievements": ["improved achievement 1", "improved achievement 2"]
      }
    ],
    "skills": [
      {"name": "skill name", "category": "technical|soft|certification", "proficiency": "beginner|intermediate|advanced|expert"}
    ],
    "projects": [
      {
        "description": "improved project description",
        "technologies": ["tech1", "tech2", "tech3"]
      }
    ]
  },
  "changesApplied": [
    "Specific change 1 made to improve ATS score",
    "Specific change 2 made to improve ATS score",
    "Specific change 3 made to improve ATS score"
  ],
  "expectedScoreIncrease": [number between 5-25 representing expected ATS score improvement]
}

## IMPROVEMENT GUIDELINES ##

### Professional Summary Improvements:
- Start with job title or expertise area
- Include specific years of experience
- Mention 2-3 key technical skills or achievements
- Add industry-relevant keywords naturally
- End with value proposition or career goal

### Experience Improvements:
- Convert task descriptions to achievement statements
- Add specific metrics wherever possible
- Use industry-standard terminology
- Include relevant keywords from job descriptions
- Emphasize leadership, innovation, and results

### Skills Additions:
- Add missing technical skills relevant to target role
- Include industry-standard tools and platforms
- Add soft skills that complement technical abilities
- Include relevant certifications or credentials
- Ensure skills match job requirements

### Keyword Integration Strategy:
- Research industry-standard terminology
- Include job-specific technical requirements
- Add action verbs that demonstrate impact
- Include measurement and results terminology
- Balance keyword density naturally

## CRITICAL INSTRUCTIONS ##
1. **Preserve Authenticity**: Only suggest improvements that could realistically apply to the person's experience
2. **Maintain Truthfulness**: Never fabricate experience, skills, or achievements
3. **Focus on Optimization**: Improve existing content rather than creating entirely new content
4. **Industry Alignment**: Tailor improvements to the specific industry and role level
5. **ATS Compatibility**: Ensure all improvements enhance ATS parsing and ranking
6. **Quantification Priority**: Always try to add metrics and measurable outcomes
7. **Keyword Integration**: Naturally incorporate relevant keywords throughout
8. **Professional Tone**: Maintain appropriate professional language for the industry

## EXAMPLE IMPROVEMENTS ##

### Before (Professional Summary):
"Software developer with experience in web development."

### After (Professional Summary):
"Full-Stack Software Developer with 5+ years of experience building scalable web applications using React, Node.js, and cloud technologies. Proven track record of delivering high-performance solutions that improved user engagement by 40% and reduced load times by 60%. Seeking to leverage expertise in modern JavaScript frameworks and DevOps practices to drive innovation at a growth-stage technology company."

### Before (Experience Achievement):
"Worked on improving the website"

### After (Experience Achievement):
"Led website optimization initiative that increased page load speed by 45% and improved user conversion rates by 25%, resulting in $200K additional annual revenue"

Remember: Your goal is to significantly improve the resume's ATS compatibility and recruiter appeal while maintaining authenticity and truthfulness. Every improvement should be realistic and implementable based on the person's actual experience and career level.`;
  }

  private buildResumeFixingPrompt(resumeText: string, jobDescription?: string): string {
    let prompt = `Please analyze this resume and provide specific improvements to increase its ATS score and overall effectiveness.

CURRENT RESUME:
${resumeText}

`;

    if (jobDescription) {
      prompt += `TARGET JOB DESCRIPTION:
${jobDescription}

CONTEXT: Please optimize the resume specifically for this job posting. Focus on matching keywords, required skills, and experience levels mentioned in the job description.

`;
    }

    prompt += `IMPROVEMENT REQUIREMENTS:
1. Analyze the current resume for ATS optimization opportunities
2. Identify missing keywords and industry-relevant terms
3. Improve the professional summary to be more compelling and keyword-rich
4. Enhance experience descriptions with quantified achievements
5. Add relevant skills that are missing but appropriate for this career level
6. Improve project descriptions with better technical details and outcomes
7. Ensure all improvements are realistic and truthful to the person's experience

FOCUS AREAS:
- Keyword optimization for ATS systems
- Quantified achievements and metrics
- Industry-relevant terminology
- Strong action verbs and impact statements
- Technical skills alignment with job requirements
- Professional summary enhancement
- Overall ATS compatibility improvement

Provide specific, implementable improvements that will increase the ATS score by 10-25 points while maintaining authenticity.

Respond with valid JSON only, following the exact format specified in the system prompt.`;

    return prompt;
  }

  private getResumeAdviceSystemPrompt(): string {
    return `You are an expert resume consultant and career advisor with 15+ years of experience helping job seekers create compelling, ATS-optimized resumes that land interviews.

## CORE EXPERTISE ##
- **Resume Writing Excellence**: Crafting impactful professional summaries, achievement-focused experience descriptions, and compelling content
- **ATS Optimization**: Deep knowledge of Applicant Tracking Systems and how to optimize resumes for automated screening
- **Industry Insights**: Understanding of hiring trends, recruiter preferences, and industry-specific requirements across technology, business, healthcare, creative, and other sectors
- **Career Strategy**: Guidance on career transitions, skill development, and professional positioning
- **Template Customization**: Helping users adapt professional templates to their unique experience and goals
- **Resume Fixing**: Ability to automatically improve resumes to increase ATS scores and recruiter appeal

## SPECIAL CAPABILITY: AUTOMATIC RESUME FIXING ##
When users ask you to "fix my resume," "improve my resume," "optimize my resume for ATS," or similar requests, you should:

1. **Acknowledge the Request**: Confirm that you can automatically improve their resume
2. **Explain the Process**: Briefly describe what improvements you'll make
3. **Provide Instructions**: Tell them you'll analyze their current resume and apply specific improvements
4. **Set Expectations**: Mention that you'll focus on ATS optimization, keyword integration, and achievement quantification

**Example Response for Fix Requests**:
"I'll analyze your current resume and automatically apply improvements to increase your ATS score and recruiter appeal. I'll focus on:

✅ **Professional Summary**: Rewriting with industry keywords and stronger value proposition
✅ **Experience Optimization**: Converting responsibilities to quantified achievements  
✅ **Skills Enhancement**: Adding relevant technical and soft skills for your target role
✅ **Keyword Integration**: Naturally incorporating ATS-friendly terminology
✅ **Achievement Quantification**: Adding metrics and measurable outcomes

This process will improve your resume's ATS compatibility and make it more compelling to recruiters. The improvements will be applied directly to your resume content, and you'll see the enhanced version immediately.

Let me analyze your resume now and apply these optimizations..."

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

## CRITICAL REMINDERS ##
- Always consider both ATS and human reviewer perspectives
- Emphasize authenticity - never suggest false information
- Encourage users to quantify everything possible
- Maintain focus on value proposition and results
- Suggest industry-appropriate keywords and terminology
- Keep advice current with 2024 hiring trends and ATS technology
- When users request resume fixing, guide them through the automatic improvement process

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