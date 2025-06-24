import { Resume, ATSScore } from '../types/resume';
import { openaiService } from './openaiService';

const commonATSKeywords = [
  'leadership', 'management', 'team', 'project', 'development', 'analysis',
  'strategy', 'implementation', 'optimization', 'collaboration', 'communication',
  'problem-solving', 'innovation', 'results', 'achievement', 'improvement',
  'efficiency', 'quality', 'customer', 'client', 'stakeholder', 'budget',
  'timeline', 'deadline', 'agile', 'scrum', 'methodology', 'framework'
];

const technicalKeywords = [
  'javascript', 'python', 'java', 'react', 'node.js', 'sql', 'aws', 'azure',
  'docker', 'kubernetes', 'git', 'api', 'database', 'cloud', 'machine learning',
  'data analysis', 'artificial intelligence', 'cybersecurity', 'devops'
];

export async function analyzeATS(resume: Resume, jobDescription?: string): Promise<ATSScore> {
  try {
    // Try to use OpenAI for enhanced analysis
    const aiAnalysis = await openaiService.analyzeATSScore(resume, jobDescription);
    
    // Convert AI analysis to our ATSScore format
    const breakdown = calculateBreakdown(resume, aiAnalysis.keywords);
    
    return {
      overall: aiAnalysis.score,
      breakdown,
      suggestions: aiAnalysis.suggestions,
      missingKeywords: aiAnalysis.keywords.filter(keyword => 
        !extractResumeText(resume).toLowerCase().includes(keyword.toLowerCase())
      ).slice(0, 10)
    };
  } catch (error) {
    console.error('Error in AI ATS analysis, falling back to basic analysis:', error);
    return performBasicAnalysis(resume, jobDescription);
  }
}

function calculateBreakdown(resume: Resume, aiKeywords: string[]): ATSScore['breakdown'] {
  const resumeText = extractResumeText(resume).toLowerCase();
  
  // Keywords score based on AI-suggested keywords
  const foundKeywords = aiKeywords.filter(keyword => 
    resumeText.includes(keyword.toLowerCase())
  );
  const keywordScore = Math.min((foundKeywords.length / aiKeywords.length) * 100, 100);
  
  // Formatting score
  const formattingScore = analyzeFormatting(resume);
  
  // Experience score
  const experienceScore = analyzeExperience(resume);
  
  // Education score
  const educationScore = analyzeEducation(resume);
  
  // Skills score
  const skillsScore = analyzeSkills(resume);
  
  return {
    keywords: Math.round(keywordScore),
    formatting: Math.round(formattingScore),
    experience: Math.round(experienceScore),
    education: Math.round(educationScore),
    skills: Math.round(skillsScore)
  };
}

function performBasicAnalysis(resume: Resume, jobDescription?: string): ATSScore {
  const resumeText = extractResumeText(resume).toLowerCase();
  const jobKeywords = jobDescription ? extractJobKeywords(jobDescription) : [];
  
  // Keyword analysis
  const foundKeywords = [...commonATSKeywords, ...technicalKeywords, ...jobKeywords]
    .filter(keyword => resumeText.includes(keyword.toLowerCase()));
  
  const keywordScore = Math.min((foundKeywords.length / 20) * 100, 100);
  
  // Other scores
  const formattingScore = analyzeFormatting(resume);
  const experienceScore = analyzeExperience(resume);
  const educationScore = analyzeEducation(resume);
  const skillsScore = analyzeSkills(resume);
  
  const overall = Math.round(
    (keywordScore * 0.3 + formattingScore * 0.2 + experienceScore * 0.25 + 
     educationScore * 0.1 + skillsScore * 0.15)
  );
  
  const missingKeywords = [...commonATSKeywords, ...technicalKeywords, ...jobKeywords]
    .filter(keyword => !resumeText.includes(keyword.toLowerCase()))
    .slice(0, 10);
  
  const suggestions = generateBasicSuggestions(resume, overall);
  
  return {
    overall,
    breakdown: {
      keywords: Math.round(keywordScore),
      formatting: Math.round(formattingScore),
      experience: Math.round(experienceScore),
      education: Math.round(educationScore),
      skills: Math.round(skillsScore)
    },
    suggestions,
    missingKeywords
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

function extractJobKeywords(jobDescription: string): string[] {
  const words = jobDescription.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3);
  
  const frequency: { [key: string]: number } = {};
  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1;
  });
  
  return Object.entries(frequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 15)
    .map(([word]) => word);
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

function generateBasicSuggestions(resume: Resume, overallScore: number): string[] {
  const suggestions: string[] = [];
  
  if (overallScore < 70) {
    suggestions.push("Add more relevant keywords from the job description");
    suggestions.push("Quantify your achievements with specific numbers and metrics");
  }
  
  if (resume.experience.length < 2) {
    suggestions.push("Include more work experience or relevant projects");
  }
  
  if (resume.skills.length < 5) {
    suggestions.push("Add more relevant skills, especially technical ones");
  }
  
  if (!resume.personalInfo.summary || resume.personalInfo.summary.length < 50) {
    suggestions.push("Write a compelling professional summary (2-3 sentences)");
  }
  
  const hasQuantifiedAchievements = resume.experience.some(exp =>
    exp.achievements.some(achievement =>
      /\d+/.test(achievement) || /%/.test(achievement) || /\$/.test(achievement)
    )
  );
  
  if (!hasQuantifiedAchievements) {
    suggestions.push("Add quantified achievements (e.g., 'Increased sales by 25%')");
  }
  
  if (resume.projects.length === 0) {
    suggestions.push("Include relevant projects to showcase your skills");
  }
  
  return suggestions.slice(0, 5);
}