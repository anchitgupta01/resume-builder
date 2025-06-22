import { Resume, ChatMessage } from '../types/resume';

export class AIAssistant {
  private conversationHistory: ChatMessage[] = [];
  
  async generateResponse(userMessage: string, resume: Resume): Promise<string> {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    const message = userMessage.toLowerCase();
    
    // Analyze user intent and provide contextual responses
    if (message.includes('summary') || message.includes('objective')) {
      return this.generateSummaryAdvice(resume);
    }
    
    if (message.includes('experience') || message.includes('work') || message.includes('job')) {
      return this.generateExperienceAdvice(resume);
    }
    
    if (message.includes('skill') || message.includes('technical')) {
      return this.generateSkillsAdvice(resume);
    }
    
    if (message.includes('achievement') || message.includes('accomplish')) {
      return this.generateAchievementAdvice(resume);
    }
    
    if (message.includes('keyword') || message.includes('ats')) {
      return this.generateKeywordAdvice(resume);
    }
    
    if (message.includes('format') || message.includes('layout')) {
      return this.generateFormattingAdvice(resume);
    }
    
    if (message.includes('project')) {
      return this.generateProjectAdvice(resume);
    }
    
    // Default helpful response
    return this.generateGeneralAdvice(resume);
  }
  
  private generateSummaryAdvice(resume: Resume): string {
    const summaryLength = resume.personalInfo.summary?.length || 0;
    
    if (summaryLength < 50) {
      return "Your professional summary needs more detail! A strong summary should be 2-3 sentences that highlight your key strengths, years of experience, and what value you bring to employers. Try something like: 'Experienced [your role] with X years in [industry/field], specializing in [key skills]. Proven track record of [major achievement] and passionate about [relevant area].'";
    }
    
    if (summaryLength > 200) {
      return "Your summary is quite long. Try to condense it to 2-3 impactful sentences. Focus on your most relevant experience, key skills, and one major achievement. Remember, recruiters spend only 6 seconds scanning a resume initially!";
    }
    
    return "Your summary looks good! To make it even stronger, ensure it includes: 1) Your years of experience, 2) Your key expertise areas, 3) A quantified achievement, and 4) What you're passionate about or seeking in your next role.";
  }
  
  private generateExperienceAdvice(resume: Resume): string {
    if (resume.experience.length === 0) {
      return "You haven't added any work experience yet. Include all relevant positions, internships, freelance work, or significant volunteer roles. For each position, focus on achievements rather than just duties. Use action verbs like 'Led', 'Developed', 'Improved', 'Managed', etc.";
    }
    
    const hasQuantifiedAchievements = resume.experience.some(exp =>
      exp.achievements.some(achievement =>
        /\d+/.test(achievement) || /%/.test(achievement) || /\$/.test(achievement)
      )
    );
    
    if (!hasQuantifiedAchievements) {
      return "Great start on your experience! Now let's make it more impactful by adding numbers. Instead of 'Improved customer satisfaction', try 'Improved customer satisfaction by 25% through implementing new feedback system'. Numbers make your achievements concrete and memorable. What specific results did you achieve in your roles?";
    }
    
    return "Your experience section is looking strong! To further enhance it, consider: 1) Using the STAR method (Situation, Task, Action, Result) for complex achievements, 2) Tailoring descriptions to match the job you're applying for, 3) Starting each bullet with a strong action verb, 4) Focusing on impact rather than responsibilities.";
  }
  
  private generateSkillsAdvice(resume: Resume): string {
    if (resume.skills.length < 5) {
      return "You should add more skills! Include both technical skills (programming languages, software, tools) and soft skills (leadership, communication, problem-solving). Think about: What software do you use daily? What programming languages do you know? What certifications do you have? What are you naturally good at?";
    }
    
    const categories = new Set(resume.skills.map(skill => skill.category));
    if (categories.size < 2) {
      return "Good skill list! Try to diversify by adding different types of skills: technical skills (tools, software, programming), soft skills (communication, leadership), languages, and certifications. This shows you're well-rounded.";
    }
    
    return "Excellent skills section! Pro tip: Organize your skills by relevance to the job you're applying for. Put the most important skills first, and consider adding proficiency levels. Also, make sure every skill you list is something you can confidently discuss in an interview.";
  }
  
  private generateAchievementAdvice(resume: Resume): string {
    return "Achievements are what set you apart! Think about times when you: 1) Saved money or time, 2) Increased efficiency or productivity, 3) Led a successful project, 4) Solved a difficult problem, 5) Received recognition or awards, 6) Improved processes or systems. Try to quantify these with specific numbers, percentages, or dollar amounts. What's a challenge you overcame at work that you're proud of?";
  }
  
  private generateKeywordAdvice(resume: Resume): string {
    return "To improve your ATS score, include relevant keywords from job descriptions you're targeting. Look for: 1) Required skills and technologies, 2) Industry-specific terms, 3) Soft skills mentioned, 4) Certifications or qualifications. But don't just stuff keywords - integrate them naturally into your experience descriptions and skills. What type of roles are you primarily targeting?";
  }
  
  private generateFormattingAdvice(resume: Resume): string {
    return "For ATS-friendly formatting: 1) Use standard section headers (Experience, Education, Skills), 2) Stick to common fonts (Arial, Calibri, Times New Roman), 3) Avoid images, graphics, or complex layouts, 4) Use bullet points for easy scanning, 5) Keep it to 1-2 pages, 6) Save as both PDF and Word formats. Your current format looks clean and professional!";
  }
  
  private generateProjectAdvice(resume: Resume): string {
    if (resume.projects.length === 0) {
      return "Adding projects can really strengthen your resume! Include: 1) Personal coding projects, 2) School assignments that showcase skills, 3) Volunteer work, 4) Freelance projects, 5) Open source contributions. For each project, describe the problem you solved, technologies used, and the impact or results. What projects have you worked on that you're proud of?";
    }
    
    return "Great project section! To make it even better: 1) Include live links or GitHub repos when possible, 2) Describe the problem your project solved, 3) Highlight the technologies and skills used, 4) Mention any challenges you overcame, 5) Quantify the impact if possible (users, downloads, performance improvements).";
  }
  
  private generateGeneralAdvice(resume: Resume): string {
    const tips = [
      "Remember to tailor your resume for each job application by emphasizing the most relevant experience and skills.",
      "Use action verbs to start your bullet points: Led, Developed, Implemented, Improved, Managed, Created, etc.",
      "Keep your resume concise but comprehensive - aim for 1-2 pages maximum.",
      "Proofread carefully! Typos can immediately disqualify you from consideration.",
      "Consider having someone else review your resume for clarity and impact.",
      "Update your resume regularly, even when you're not job searching, so you don't forget important achievements."
    ];
    
    return tips[Math.floor(Math.random() * tips.length)] + " What specific aspect of your resume would you like to improve?";
  }
}