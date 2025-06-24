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
        max_tokens: 800,
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
    return `You are an expert ATS (Applicant Tracking System) analyzer with deep knowledge of how modern recruitment software processes and ranks resumes.

## ANALYSIS FRAMEWORK ##
You must evaluate resumes across these critical dimensions:

### 1. KEYWORD OPTIMIZATION (30% weight)
- Industry-relevant keywords and phrases
- Job-specific technical skills and tools
- Action verbs and power words
- Natural keyword integration (not stuffing)

### 2. FORMATTING & STRUCTURE (25% weight)
- Clean, ATS-readable format
- Proper section headers and hierarchy
- Consistent formatting and spacing
- Standard fonts and layouts

### 3. CONTENT QUALITY (25% weight)
- Quantified achievements and results
- Relevant work experience
- Clear job progression and growth
- Industry-appropriate content depth

### 4. COMPLETENESS (20% weight)
- Essential contact information
- Professional summary/objective
- Complete work history with dates
- Relevant education and certifications

## SCORING METHODOLOGY ##
- 90-100: Exceptional - Top 5% of resumes, highly optimized
- 80-89: Excellent - Strong ATS compatibility, minor improvements needed
- 70-79: Good - Solid foundation, some optimization required
- 60-69: Fair - Needs significant improvements for ATS success
- 50-59: Poor - Major issues that will hurt ATS ranking
- Below 50: Critical - Fundamental problems requiring complete revision

## RESPONSE FORMAT ##
Always respond with valid JSON in this exact structure:
{
  "score": [number between 0-100],
  "analysis": "[detailed 2-3 sentence analysis of strengths and key issues]",
  "suggestions": ["specific actionable improvement 1", "specific actionable improvement 2", ...],
  "keywords": ["relevant keyword 1", "relevant keyword 2", ...]
}

## ANALYSIS EXAMPLES ##

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

## CRITICAL INSTRUCTIONS ##
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

  private getFallbackAdvice(userMessage: string, resume: Resume): string {
    const message = userMessage.toLowerCase();
    
    // Template-related questions
    if (message.includes('template') || message.includes('customize')) {
      return "Great question about template customization! Here's how to make any template your own:\n\n**1. Personal Information**: Replace all contact details with your own, but keep the professional summary structure and adapt the content to your experience.\n\n**2. Work Experience**: Use the template's achievement format but substitute with your actual accomplishments. Keep the quantified structure (numbers, percentages, results) but make the content authentic to your career.\n\n**3. Skills Section**: Replace template skills with your actual expertise, maintaining the same organization and proficiency levels that match your real abilities.\n\n**4. Projects**: Substitute template projects with your own work, keeping the same descriptive format and technology listings.\n\n**Key Tip**: Templates provide the professional structure and ATS-friendly formatting - your job is to fill them with compelling, truthful content about your unique experience and achievements!";
    }
    
    if (message.includes('summary') || message.includes('objective')) {
      return "Your professional summary should be 2-3 sentences highlighting your key strengths, years of experience, and value proposition. Start with your job title or expertise area, mention your years of experience, highlight 2-3 key skills or achievements, and end with what you're seeking or what value you bring.\n\n**Template**: '[Title] with [X years] experience in [key skills]. [Major achievement or expertise]. Seeking to [career goal] at [type of company].'\n\n**Example**: 'Experienced Software Engineer with 5+ years developing scalable web applications using React and Node.js. Led cross-functional teams to deliver 15+ projects on time, improving system performance by 40%. Seeking to leverage full-stack expertise and leadership skills to drive innovation at a growth-stage technology company.'\n\n**ATS Tips**: Include 3-5 relevant keywords from your target job descriptions naturally within the summary.";
    }
    
    if (message.includes('experience') || message.includes('work') || message.includes('job') || message.includes('achievement')) {
      return "Transform your experience section by focusing on achievements rather than responsibilities. Use the STAR method (Situation, Task, Action, Result) and quantify everything possible.\n\n**Formula**: Action verb + what you did + quantified result\n\n**Before**: 'Managed social media accounts'\n**After**: 'Increased social media engagement by 150% over 6 months by developing and executing content strategy across 4 platforms, resulting in 2,000 new followers and 25% boost in website traffic'\n\n**Power Action Verbs**: Led, Developed, Implemented, Optimized, Achieved, Increased, Reduced, Streamlined, Delivered, Built\n\n**Quantification Ideas**: Percentages, dollar amounts, time saved, team sizes, project counts, user numbers, efficiency gains, cost reductions";
    }
    
    if (message.includes('skill')) {
      return "Organize your skills strategically by relevance to your target role:\n\n**Technical Skills**: Programming languages, software, tools, platforms\n**Soft Skills**: Leadership, communication, problem-solving, teamwork\n**Certifications**: Professional credentials and licenses\n**Languages**: Specify proficiency levels\n\n**Pro Tips**:\n• List skills in order of relevance to target job\n• Include proficiency levels when meaningful\n• Match skills to job description keywords\n• Group similar skills together\n• Only include skills you can confidently discuss in interviews\n\n**Example Organization**:\n- Technical: JavaScript (Expert), React (Advanced), Python (Intermediate)\n- Leadership: Team Management, Project Planning, Mentoring\n- Certifications: AWS Certified Developer, Scrum Master";
    }
    
    if (message.includes('keyword') || message.includes('ats')) {
      return "To optimize for ATS systems, study 3-5 job descriptions for your target role and identify recurring keywords. Incorporate these naturally throughout your resume:\n\n**Where to Include Keywords**:\n• Professional summary (3-5 key terms)\n• Experience descriptions (naturally woven in)\n• Skills section (exact matches)\n• Project descriptions (technical terms)\n\n**Keyword Categories**:\n• Job titles and role variations\n• Required technical skills and tools\n• Industry terminology and buzzwords\n• Soft skills mentioned in postings\n• Certifications and qualifications\n\n**Example**: If 'project management' appears frequently, write: 'Led project management initiatives for 5 cross-functional teams, delivering projects 20% ahead of schedule using Agile methodologies'\n\n**Avoid**: Keyword stuffing - always prioritize natural, readable content.";
    }
    
    if (message.includes('format') || message.includes('layout')) {
      return "Use a clean, ATS-friendly format with these best practices:\n\n**Structure**:\n• Standard section headers: 'Professional Experience,' 'Education,' 'Skills'\n• Consistent formatting throughout\n• Clear hierarchy with proper spacing\n• Bullet points for easy scanning\n\n**Formatting Rules**:\n• Standard fonts: Arial, Calibri, Times New Roman (10-12pt)\n• Avoid graphics, tables, or complex layouts\n• Use consistent date formats (MM/YYYY)\n• Left-align all content\n• Save as both PDF and Word formats\n\n**Length Guidelines**:\n• Entry-level: 1 page\n• Mid-level: 1-2 pages\n• Senior/Executive: 2 pages maximum\n\n**ATS-Friendly Elements**: Simple formatting, standard section names, consistent spacing, no headers/footers with critical info.";
    }
    
    if (message.includes('project')) {
      return "Projects showcase your practical skills and initiative. Include these types:\n\n**Project Types**:\n• Personal coding/creative projects\n• Significant school assignments\n• Volunteer work with measurable impact\n• Freelance or consulting projects\n• Open-source contributions\n\n**For Each Project Include**:\n• **Problem**: What challenge did you solve?\n• **Action**: What technologies/skills did you use?\n• **Role**: What was your specific contribution?\n• **Result**: What was the measurable outcome?\n• **Links**: Live demo and GitHub repository\n\n**Example**: 'E-commerce Web App: Built full-stack application using React, Node.js, and MongoDB. Implemented user authentication, payment processing, and inventory management. Deployed on AWS with 99.9% uptime, supporting 500+ concurrent users. [Live Demo] [GitHub]'\n\n**Pro Tip**: Choose projects that demonstrate skills relevant to your target role.";
    }
    
    if (message.includes('quantify') || message.includes('numbers') || message.includes('metrics')) {
      return "Quantifying achievements makes your resume compelling and credible. Here's how to add numbers to any role:\n\n**Common Metrics**:\n• **Percentages**: Increased efficiency by 30%, improved accuracy by 25%\n• **Dollar Amounts**: Saved $50K annually, generated $2M in revenue\n• **Time**: Reduced processing time from 2 hours to 30 minutes\n• **Volume**: Managed 100+ customer accounts, processed 500+ orders daily\n• **Team Size**: Led team of 8 developers, coordinated 15-person project\n• **Scope**: Across 5 departments, 3 locations, 10 product lines\n\n**If You Don't Have Exact Numbers**:\n• Use ranges: 'Managed 50-75 client relationships'\n• Estimate conservatively: 'Approximately 200+ users'\n• Use relative terms: 'Significantly reduced,' 'Substantially improved'\n\n**Framework**: [Action] + [What] + [Quantified Result] + [Time Period]\n**Example**: 'Streamlined inventory process, reducing stock discrepancies by 40% over 6 months'";
    }
    
    // General advice
    return "I'm here to help you create an outstanding resume! I can assist with:\n\n**✏️ Content Creation**:\n• Writing compelling professional summaries\n• Crafting achievement-focused experience descriptions\n• Optimizing skills sections for your target role\n• Developing impactful project descriptions\n\n**🎯 ATS Optimization**:\n• Keyword integration strategies\n• Formatting best practices\n• Industry-specific terminology\n• Applicant tracking system compatibility\n\n**📋 Template Guidance**:\n• Customizing professional templates\n• Adapting example content to your experience\n• Maintaining structure while personalizing content\n• Preserving ATS-friendly formatting\n\n**📈 Career Strategy**:\n• Positioning for career transitions\n• Highlighting transferable skills\n• Industry-specific advice\n• Interview preparation tips\n\nWhat specific aspect would you like to improve? Feel free to ask about any section of your resume or share a particular challenge you're facing!";
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