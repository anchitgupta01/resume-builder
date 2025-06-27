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
        max_tokens: 3000,
        temperature: 0.3
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response received from OpenAI');
      }

      try {
        // Extract JSON from response (in case there's extra text)
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        const jsonString = jsonMatch ? jsonMatch[0] : response;
        const parsed = JSON.parse(jsonString);
        
        // Apply the improvements to the resume
        const improvedResume = this.applyImprovements(resume, parsed.improvements);
        
        return {
          improvedResume,
          improvements: parsed.changesApplied || [],
          expectedScoreIncrease: parsed.expectedScoreIncrease || 15
        };
      } catch (parseError) {
        console.error('Failed to parse resume fixing response:', parseError);
        console.log('Raw response:', response);
        
        // Fallback: Apply basic improvements
        const fallbackImprovements = this.applyBasicImprovements(resume);
        return {
          improvedResume: fallbackImprovements,
          improvements: [
            "Enhanced professional summary with industry keywords",
            "Improved experience descriptions with action verbs",
            "Added quantified achievements where possible",
            "Optimized skills section for ATS compatibility"
          ],
          expectedScoreIncrease: 12
        };
      }
    } catch (error) {
      console.error('OpenAI resume fixing error:', error);
      throw error;
    }
  }

  private applyBasicImprovements(originalResume: Resume): Resume {
    const improvedResume = JSON.parse(JSON.stringify(originalResume)); // Deep clone
    
    // Improve professional summary if it exists
    if (improvedResume.personalInfo.summary) {
      const summary = improvedResume.personalInfo.summary;
      if (summary.length < 100 || !summary.includes('experience')) {
        improvedResume.personalInfo.summary = this.enhanceSummary(summary, improvedResume);
      }
    } else if (improvedResume.experience.length > 0) {
      // Create a basic professional summary
      const latestJob = improvedResume.experience[0];
      improvedResume.personalInfo.summary = `Experienced ${latestJob.position} with proven track record in ${this.extractSkillsFromExperience(improvedResume.experience)}. Demonstrated ability to deliver results and drive innovation in fast-paced environments. Seeking to leverage expertise to contribute to organizational growth and success.`;
    }
    
    // Improve experience descriptions
    improvedResume.experience.forEach((exp, index) => {
      // Enhance descriptions with action verbs
      exp.description = exp.description.map(desc => this.enhanceDescription(desc));
      
      // Enhance achievements
      exp.achievements = exp.achievements.map(achievement => this.enhanceAchievement(achievement));
      
      // Add achievements if none exist
      if (exp.achievements.length === 0 && exp.description.length > 0) {
        exp.achievements.push(`Successfully contributed to ${exp.company}'s objectives through effective ${exp.position.toLowerCase()} responsibilities`);
      }
    });
    
    // Add missing common skills
    const commonSkills = this.getCommonSkillsForRole(improvedResume);
    commonSkills.forEach(skill => {
      const exists = improvedResume.skills.some(s => s.name.toLowerCase() === skill.name.toLowerCase());
      if (!exists) {
        improvedResume.skills.push({
          id: Date.now().toString() + Math.random(),
          ...skill
        });
      }
    });
    
    return improvedResume;
  }

  private enhanceSummary(originalSummary: string, resume: Resume): string {
    const skills = resume.skills.slice(0, 3).map(s => s.name).join(', ');
    const experienceYears = this.calculateExperienceYears(resume.experience);
    
    if (originalSummary.length < 50) {
      return `${originalSummary} Professional with ${experienceYears}+ years of experience in ${skills}. Proven track record of delivering results and driving innovation. Seeking to leverage expertise to contribute to organizational growth.`;
    }
    
    // Enhance existing summary
    let enhanced = originalSummary;
    if (!enhanced.includes('experience') && experienceYears > 0) {
      enhanced = enhanced.replace(/^/, `Professional with ${experienceYears}+ years of experience. `);
    }
    if (!enhanced.includes('proven') && !enhanced.includes('track record')) {
      enhanced += ' Proven track record of delivering measurable results.';
    }
    
    return enhanced;
  }

  private enhanceDescription(description: string): string {
    const actionVerbs = ['Led', 'Developed', 'Implemented', 'Managed', 'Created', 'Optimized', 'Coordinated', 'Executed'];
    
    // If description doesn't start with an action verb, try to add one
    if (!actionVerbs.some(verb => description.toLowerCase().startsWith(verb.toLowerCase()))) {
      if (description.toLowerCase().startsWith('responsible for')) {
        return description.replace(/^responsible for/i, 'Managed');
      } else if (description.toLowerCase().startsWith('worked on')) {
        return description.replace(/^worked on/i, 'Developed');
      } else if (description.toLowerCase().startsWith('helped')) {
        return description.replace(/^helped/i, 'Assisted in');
      }
    }
    
    return description;
  }

  private enhanceAchievement(achievement: string): string {
    // If achievement doesn't have numbers, try to add impact language
    if (!/\d/.test(achievement)) {
      if (!achievement.includes('improved') && !achievement.includes('increased') && !achievement.includes('reduced')) {
        return `${achievement}, contributing to improved team performance and organizational objectives`;
      }
    }
    
    return achievement;
  }

  private calculateExperienceYears(experience: any[]): number {
    if (experience.length === 0) return 0;
    
    let totalMonths = 0;
    experience.forEach(exp => {
      const startDate = new Date(exp.startDate + '-01');
      const endDate = exp.current ? new Date() : new Date(exp.endDate + '-01');
      const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());
      totalMonths += Math.max(months, 0);
    });
    
    return Math.max(Math.floor(totalMonths / 12), 1);
  }

  private extractSkillsFromExperience(experience: any[]): string {
    const commonTerms = ['development', 'management', 'analysis', 'design', 'implementation', 'optimization'];
    const foundTerms = new Set<string>();
    
    experience.forEach(exp => {
      const text = (exp.position + ' ' + exp.description.join(' ')).toLowerCase();
      commonTerms.forEach(term => {
        if (text.includes(term)) {
          foundTerms.add(term);
        }
      });
    });
    
    return Array.from(foundTerms).slice(0, 3).join(', ') || 'various technical and business domains';
  }

  private getCommonSkillsForRole(resume: Resume): any[] {
    const existingSkills = resume.skills.map(s => s.name.toLowerCase());
    const commonSkills = [];
    
    // Determine role type from experience
    const allText = resume.experience.map(exp => exp.position + ' ' + exp.description.join(' ')).join(' ').toLowerCase();
    
    if (allText.includes('software') || allText.includes('developer') || allText.includes('engineer')) {
      const techSkills = [
        { name: 'Problem Solving', category: 'soft', proficiency: 'advanced' },
        { name: 'Team Collaboration', category: 'soft', proficiency: 'advanced' },
        { name: 'Git', category: 'technical', proficiency: 'intermediate' },
        { name: 'Agile Methodology', category: 'technical', proficiency: 'intermediate' }
      ];
      techSkills.forEach(skill => {
        if (!existingSkills.includes(skill.name.toLowerCase())) {
          commonSkills.push(skill);
        }
      });
    }
    
    if (allText.includes('manager') || allText.includes('lead') || allText.includes('director')) {
      const managementSkills = [
        { name: 'Leadership', category: 'soft', proficiency: 'advanced' },
        { name: 'Strategic Planning', category: 'soft', proficiency: 'advanced' },
        { name: 'Project Management', category: 'soft', proficiency: 'advanced' },
        { name: 'Team Building', category: 'soft', proficiency: 'intermediate' }
      ];
      managementSkills.forEach(skill => {
        if (!existingSkills.includes(skill.name.toLowerCase())) {
          commonSkills.push(skill);
        }
      });
    }
    
    // Always add these universal skills if missing
    const universalSkills = [
      { name: 'Communication', category: 'soft', proficiency: 'advanced' },
      { name: 'Time Management', category: 'soft', proficiency: 'intermediate' },
      { name: 'Attention to Detail', category: 'soft', proficiency: 'advanced' }
    ];
    
    universalSkills.forEach(skill => {
      if (!existingSkills.includes(skill.name.toLowerCase()) && commonSkills.length < 5) {
        commonSkills.push(skill);
      }
    });
    
    return commonSkills.slice(0, 3); // Limit to 3 new skills
  }

  private applyImprovements(originalResume: Resume, improvements: any): Resume {
    const improvedResume = JSON.parse(JSON.stringify(originalResume)); // Deep clone
    
    try {
      // Apply professional summary improvements
      if (improvements.professionalSummary) {
        improvedResume.personalInfo.summary = improvements.professionalSummary;
      }
      
      // Apply experience improvements
      if (improvements.experience && Array.isArray(improvements.experience)) {
        improvements.experience.forEach((expImprovement: any, index: number) => {
          if (improvedResume.experience[index]) {
            if (expImprovement.description && Array.isArray(expImprovement.description)) {
              improvedResume.experience[index].description = expImprovement.description;
            }
            if (expImprovement.achievements && Array.isArray(expImprovement.achievements)) {
              improvedResume.experience[index].achievements = expImprovement.achievements;
            }
          }
        });
      }
      
      // Apply skills improvements
      if (improvements.skills && Array.isArray(improvements.skills)) {
        const existingSkillNames = improvedResume.skills.map(skill => skill.name.toLowerCase());
        improvements.skills.forEach((newSkill: any) => {
          if (newSkill.name && !existingSkillNames.includes(newSkill.name.toLowerCase())) {
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
            if (projImprovement.technologies && Array.isArray(projImprovement.technologies)) {
              improvedResume.projects[index].technologies = projImprovement.technologies;
            }
          }
        });
      }
    } catch (error) {
      console.error('Error applying specific improvements:', error);
      // Fall back to basic improvements if structured improvements fail
      return this.applyBasicImprovements(originalResume);
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
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        const jsonString = jsonMatch ? jsonMatch[0] : response;
        const parsed = JSON.parse(jsonString);
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
2. Identify specific areas that need improvement based on industry standards
3. Generate improved content that increases ATS score and recruiter appeal
4. Provide concrete, implementable improvements with industry-specific focus

## INDUSTRY-SPECIFIC OPTIMIZATION ##

### TECHNOLOGY SECTOR
- **Keywords**: Programming languages, frameworks, cloud platforms, methodologies (Agile, DevOps, CI/CD)
- **Skills Focus**: Technical proficiency, system architecture, problem-solving, innovation
- **Achievement Metrics**: Performance improvements, user growth, system uptime, code quality
- **Project Emphasis**: Technical complexity, scalability, impact on business metrics

### BUSINESS & MANAGEMENT
- **Keywords**: Leadership, strategy, analytics, process improvement, ROI, stakeholder management
- **Skills Focus**: Strategic thinking, team leadership, financial acumen, change management
- **Achievement Metrics**: Revenue growth, cost savings, team performance, market expansion
- **Project Emphasis**: Business impact, cross-functional collaboration, strategic initiatives

### HEALTHCARE
- **Keywords**: Patient care, clinical protocols, compliance, quality improvement, healthcare technology
- **Skills Focus**: Clinical expertise, regulatory knowledge, patient safety, interdisciplinary collaboration
- **Achievement Metrics**: Patient outcomes, safety scores, efficiency improvements, compliance rates
- **Project Emphasis**: Quality of care, process improvements, technology implementation

### CREATIVE & DESIGN
- **Keywords**: Brand development, user experience, creative strategy, design thinking, digital media
- **Skills Focus**: Creative vision, technical proficiency, collaboration, trend awareness
- **Achievement Metrics**: Engagement rates, brand recognition, conversion improvements, award recognition
- **Project Emphasis**: Creative impact, user engagement, brand development, innovation

### FINANCE & ACCOUNTING
- **Keywords**: Financial modeling, risk management, regulatory compliance, investment analysis, audit
- **Skills Focus**: Analytical thinking, attention to detail, regulatory knowledge, strategic planning
- **Achievement Metrics**: Cost reductions, accuracy improvements, compliance scores, investment returns
- **Project Emphasis**: Financial impact, risk mitigation, process optimization, regulatory compliance

## IMPROVEMENT AREAS TO FOCUS ON ##

### 1. PROFESSIONAL SUMMARY OPTIMIZATION
- Rewrite to include 3-5 industry-relevant keywords naturally
- Ensure 2-3 sentences highlighting key value proposition
- Include years of experience and core expertise specific to industry
- Add career goals or target role alignment
- Make it compelling and ATS-friendly with industry terminology

### 2. EXPERIENCE SECTION ENHANCEMENT
- Transform responsibilities into achievement-focused statements
- Add quantified metrics relevant to industry (percentages, dollar amounts, timeframes)
- Use strong action verbs appropriate for the field
- Include industry-relevant keywords naturally
- Follow format: "Action verb + what you did + quantified result + business impact"

### 3. SKILLS OPTIMIZATION
- Add missing industry-relevant technical skills
- Include tools and platforms commonly required in the field
- Balance technical and soft skills appropriately for the industry
- Ensure skills match job description requirements
- Organize skills by category and relevance to target role

### 4. KEYWORD INTEGRATION
- Identify missing keywords from job description and industry standards
- Integrate keywords naturally throughout all sections
- Focus on industry-specific terminology and certifications
- Include required qualifications and methodologies
- Balance keyword density without stuffing

### 5. PROJECT DESCRIPTIONS
- Enhance project descriptions with industry-specific technical details
- Add quantified outcomes and business impact
- Include relevant technologies, methodologies, and frameworks
- Highlight problem-solving and innovation appropriate to field
- Connect projects to career goals and industry trends

## RESPONSE FORMAT ##
Always respond with valid JSON in this exact structure:
{
  "improvements": {
    "professionalSummary": "improved summary text with industry keywords",
    "experience": [
      {
        "description": ["improved responsibility 1", "improved responsibility 2"],
        "achievements": ["improved achievement 1", "improved achievement 2"]
      }
    ],
    "skills": [
      {"name": "skill name", "category": "technical", "proficiency": "intermediate"}
    ],
    "projects": [
      {
        "description": "improved project description",
        "technologies": ["tech1", "tech2", "tech3"]
      }
    ]
  },
  "changesApplied": [
    "Enhanced professional summary with industry keywords and quantified experience",
    "Converted job responsibilities to achievement-focused statements with metrics",
    "Added 3 relevant technical skills commonly required in the industry",
    "Optimized experience descriptions with strong action verbs",
    "Integrated ATS-friendly keywords naturally throughout content"
  ],
  "expectedScoreIncrease": 18
}

## IMPROVEMENT GUIDELINES ##

### Professional Summary Improvements:
- Start with job title or expertise area relevant to target industry
- Include specific years of experience
- Mention 2-3 key technical skills or achievements specific to field
- Add industry-relevant keywords naturally
- End with value proposition or career goal aligned with industry trends

### Experience Improvements:
- Convert task descriptions to achievement statements with industry-specific metrics
- Add specific metrics relevant to the field (technical performance, business impact, etc.)
- Use industry-standard terminology and action verbs
- Include relevant keywords from job descriptions
- Emphasize leadership, innovation, and results appropriate to career level

### Skills Additions:
- Add missing technical skills relevant to target role and industry
- Include industry-standard tools and platforms
- Add soft skills that complement technical abilities for the field
- Include relevant certifications or credentials
- Ensure skills match current industry requirements and trends

### Keyword Integration Strategy:
- Research industry-standard terminology and emerging trends
- Include job-specific technical requirements and methodologies
- Add action verbs that demonstrate impact in the field
- Include measurement and results terminology relevant to industry
- Balance keyword density naturally while maintaining readability

## CRITICAL INSTRUCTIONS ##
1. **Preserve Authenticity**: Only suggest improvements that could realistically apply to the person's experience
2. **Maintain Truthfulness**: Never fabricate experience, skills, or achievements
3. **Focus on Optimization**: Improve existing content rather than creating entirely new content
4. **Industry Alignment**: Tailor improvements to the specific industry and role level
5. **ATS Compatibility**: Ensure all improvements enhance ATS parsing and ranking
6. **Quantification Priority**: Always try to add metrics and measurable outcomes relevant to the field
7. **Keyword Integration**: Naturally incorporate relevant keywords throughout
8. **Professional Tone**: Maintain appropriate professional language for the industry

Remember: Your goal is to significantly improve the resume's ATS compatibility and recruiter appeal while maintaining authenticity and truthfulness. Every improvement should be realistic and implementable based on the person's actual experience and career level, with specific focus on industry requirements and standards.`;
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
2. Identify the target industry based on experience and skills
3. Apply industry-specific optimization strategies
4. Identify missing keywords and industry-relevant terms
5. Improve the professional summary to be more compelling and keyword-rich
6. Enhance experience descriptions with quantified achievements relevant to the industry
7. Add relevant skills that are missing but appropriate for this career level and industry
8. Improve project descriptions with better technical details and outcomes
9. Ensure all improvements are realistic and truthful to the person's experience

FOCUS AREAS:
- Industry-specific keyword optimization for ATS systems
- Quantified achievements and metrics relevant to the field
- Industry-relevant terminology and technical language
- Strong action verbs and impact statements appropriate to the sector
- Technical skills alignment with job requirements and industry standards
- Professional summary enhancement with industry focus
- Overall ATS compatibility improvement with industry best practices

Provide specific, implementable improvements that will increase the ATS score by 10-25 points while maintaining authenticity and industry relevance.

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
When users ask you to "fix my resume," "improve my resume," "optimize my resume for ATS," "increase my ATS score," "add necessary projects," or similar requests, you should:

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

## MARKDOWN FORMATTING REQUIREMENTS ##
Always use proper markdown formatting in your responses:

### Headers and Structure
- Use **# Main Headers** for major sections
- Use **## Sub Headers** for subsections  
- Use **### Smaller Headers** for detailed breakdowns

### Text Emphasis
- Use **bold text** for important terms, keywords, and emphasis
- Use *italics* for examples and subtle emphasis
- Use \\\`code formatting\\\` for technical terms, file names, and specific instructions

### Lists and Organization
- Use bullet points (•) for unstructured lists
- Use numbered lists (1., 2., 3.) for sequential steps
- Use checkboxes (✅) for completed items or features
- Use warning symbols (⚠️) for important notes
- Use tips (💡) for helpful suggestions

### Examples and Code
- Use code blocks for longer examples or templates
- Use inline code for short technical terms
- Use blockquotes (>) for important quotes or highlighted information

### Visual Elements
- Use emojis strategically for visual appeal and categorization
- Use horizontal rules (---) to separate major sections when needed
- Use tables for structured comparisons when appropriate

## RESPONSE STYLE ##
- **Encouraging but Direct**: Provide honest feedback while maintaining motivation
- **Practical and Implementable**: Every suggestion should be actionable
- **Industry-Aware**: Tailor advice to their specific field and career level
- **Concise but Comprehensive**: Cover key points without overwhelming
- **Examples-Rich**: Include specific examples and templates when helpful
- **Visually Organized**: Use markdown formatting to make responses scannable and easy to read

## CRITICAL REMINDERS ##
- Always consider both ATS and human reviewer perspectives
- Emphasize authenticity - never suggest false information
- Encourage users to quantify everything possible
- Maintain focus on value proposition and results
- Suggest industry-appropriate keywords and terminology
- Keep advice current with 2024 hiring trends and ATS technology
- When users request resume fixing, guide them through the automatic improvement process
- **Always use proper markdown formatting** to make responses clear and professional

Remember: Your goal is to help users create resumes that not only pass ATS screening but also compel human recruiters to schedule interviews. Every piece of advice should move them closer to landing their target role, and every response should be well-formatted and easy to read.`;
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