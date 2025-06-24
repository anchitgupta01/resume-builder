import { Resume, ATSScore } from '../types/resume';
import { openaiService } from './openaiService';

export async function analyzeATS(resume: Resume, jobDescription?: string): Promise<ATSScore> {
  try {
    // Always use OpenAI for ATS analysis
    const aiAnalysis = await openaiService.analyzeATSScore(resume, jobDescription);
    
    // Convert AI analysis to our ATSScore format
    const breakdown = calculateBreakdown(resume, aiAnalysis.keywords, aiAnalysis.score);
    
    return {
      overall: aiAnalysis.score,
      breakdown,
      suggestions: aiAnalysis.suggestions,
      missingKeywords: aiAnalysis.keywords.filter(keyword => 
        !extractResumeText(resume).toLowerCase().includes(keyword.toLowerCase())
      ).slice(0, 10)
    };
  } catch (error) {
    console.error('Error in AI ATS analysis:', error);
    throw error; // Propagate the error instead of falling back
  }
}

function calculateBreakdown(resume: Resume, aiKeywords: string[], overallScore: number): ATSScore['breakdown'] {
  const resumeText = extractResumeText(resume).toLowerCase();
  
  // Keywords score based on AI-suggested keywords
  const foundKeywords = aiKeywords.filter(keyword => 
    resumeText.includes(keyword.toLowerCase())
  );
  const keywordScore = aiKeywords.length > 0 
    ? Math.min((foundKeywords.length / aiKeywords.length) * 100, 100)
    : 60;
  
  // Calculate other scores based on resume content
  const formattingScore = analyzeFormatting(resume);
  const experienceScore = analyzeExperience(resume);
  const educationScore = analyzeEducation(resume);
  const skillsScore = analyzeSkills(resume);
  
  // Adjust scores to align with overall AI score
  const calculatedAverage = (keywordScore * 0.3 + formattingScore * 0.2 + 
                           experienceScore * 0.25 + educationScore * 0.1 + skillsScore * 0.15);
  
  const adjustmentFactor = overallScore / calculatedAverage;
  
  return {
    keywords: Math.round(Math.min(keywordScore * adjustmentFactor, 100)),
    formatting: Math.round(Math.min(formattingScore * adjustmentFactor, 100)),
    experience: Math.round(Math.min(experienceScore * adjustmentFactor, 100)),
    education: Math.round(Math.min(educationScore * adjustmentFactor, 100)),
    skills: Math.round(Math.min(skillsScore * adjustmentFactor, 100))
  };
}

function extractResumeText(resume: Resume): string {
  const text = [
    resume.personalInfo.summary,
    ...resume.experience.flatMap(exp => [exp.company, exp.position, ...exp.description, ...exp.achievements]),
    ...resume.education.map(edu => `${edu.degree} ${edu.field} ${edu.institution}`),
    ...resume.skills.map(skill => skill.name),
    ...resume.projects.flatMap(proj => [proj.name, proj.description, ...proj.technologies])
  ].join(' ');
  
  return text;
}

function analyzeFormatting(resume: Resume): number {
  let score = 100;
  
  // Check for essential sections
  if (!resume.personalInfo.email) score -= 10;
  if (!resume.personalInfo.phone) score -= 10;
  if (resume.experience.length === 0) score -= 20;
  if (resume.skills.length === 0) score -= 15;
  
  // Check for contact info formatting
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (resume.personalInfo.email && !emailRegex.test(resume.personalInfo.email)) {
    score -= 5;
  }
  
  return Math.max(score, 0);
}

function analyzeExperience(resume: Resume): number {
  if (resume.experience.length === 0) return 0;
  
  let score = 60; // Base score for having experience
  
  // Bonus for multiple positions
  if (resume.experience.length >= 2) score += 15;
  if (resume.experience.length >= 3) score += 10;
  
  // Check for quantified achievements
  const hasQuantifiedAchievements = resume.experience.some(exp =>
    exp.achievements.some(achievement =>
      /\d+/.test(achievement) || /%/.test(achievement) || /\$/.test(achievement)
    )
  );
  
  if (hasQuantifiedAchievements) score += 15;
  
  return Math.min(score, 100);
}

function analyzeEducation(resume: Resume): number {
  if (resume.education.length === 0) return 50; // Not always required
  
  let score = 80; // Base score for having education
  
  // Bonus for relevant degree
  const hasRelevantDegree = resume.education.some(edu =>
    ['computer science', 'engineering', 'business', 'marketing', 'design']
      .some(field => edu.field.toLowerCase().includes(field))
  );
  
  if (hasRelevantDegree) score += 20;
  
  return Math.min(score, 100);
}

function analyzeSkills(resume: Resume): number {
  if (resume.skills.length === 0) return 0;
  
  let score = 50; // Base score for having skills
  
  // Bonus for variety of skills
  const categories = new Set(resume.skills.map(skill => skill.category));
  score += categories.size * 10;
  
  // Bonus for technical skills
  const hasTechnicalSkills = resume.skills.some(skill => skill.category === 'technical');
  if (hasTechnicalSkills) score += 20;
  
  return Math.min(score, 100);
}