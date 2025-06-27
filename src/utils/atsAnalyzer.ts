import { Resume, ATSScore } from '../types/resume';
import { openaiService } from './openaiService';

export async function analyzeATS(resume: Resume, jobDescription?: string): Promise<ATSScore> {
  // Check if resume is essentially empty
  if (isResumeEmpty(resume)) {
    return {
      overall: 0,
      breakdown: {
        keywords: 0,
        formatting: 0,
        experience: 0,
        education: 0,
        skills: 0
      },
      suggestions: [
        'Start by adding your personal information (name, email, phone)',
        'Add your work experience with specific achievements',
        'Include relevant skills for your target role',
        'Write a compelling professional summary',
        'Add your education background',
        'Include projects that showcase your abilities'
      ],
      missingKeywords: []
    };
  }

  try {
    // Use OpenAI for ATS analysis only if resume has content
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
    
    // Fallback to basic analysis if AI fails
    return calculateBasicATSScore(resume);
  }
}

function isResumeEmpty(resume: Resume): boolean {
  const hasPersonalInfo = !!(
    resume.personalInfo.fullName?.trim() ||
    resume.personalInfo.email?.trim() ||
    resume.personalInfo.phone?.trim() ||
    resume.personalInfo.summary?.trim()
  );
  
  const hasContent = !!(
    resume.experience.length > 0 ||
    resume.education.length > 0 ||
    resume.skills.length > 0 ||
    resume.projects.length > 0
  );
  
  return !hasPersonalInfo && !hasContent;
}

function calculateBasicATSScore(resume: Resume): ATSScore {
  const breakdown = {
    keywords: analyzeKeywords(resume),
    formatting: analyzeFormatting(resume),
    experience: analyzeExperience(resume),
    education: analyzeEducation(resume),
    skills: analyzeSkills(resume)
  };
  
  const overall = Math.round(
    (breakdown.keywords * 0.3) +
    (breakdown.formatting * 0.2) +
    (breakdown.experience * 0.25) +
    (breakdown.education * 0.1) +
    (breakdown.skills * 0.15)
  );
  
  const suggestions = generateBasicSuggestions(resume, breakdown);
  
  return {
    overall,
    breakdown,
    suggestions,
    missingKeywords: []
  };
}

function analyzeKeywords(resume: Resume): number {
  const text = extractResumeText(resume).toLowerCase();
  
  // Common professional keywords
  const commonKeywords = [
    'managed', 'developed', 'created', 'implemented', 'designed',
    'led', 'improved', 'increased', 'reduced', 'achieved',
    'collaborated', 'coordinated', 'analyzed', 'optimized'
  ];
  
  const foundKeywords = commonKeywords.filter(keyword => 
    text.includes(keyword)
  );
  
  return Math.min((foundKeywords.length / commonKeywords.length) * 100, 100);
}

function generateBasicSuggestions(resume: Resume, breakdown: ATSScore['breakdown']): string[] {
  const suggestions: string[] = [];
  
  if (breakdown.keywords < 50) {
    suggestions.push('Use more action verbs and industry-specific keywords in your descriptions');
  }
  
  if (breakdown.formatting < 80) {
    suggestions.push('Ensure all required contact information is complete and properly formatted');
  }
  
  if (breakdown.experience < 60) {
    suggestions.push('Add more detailed work experience with quantified achievements');
  }
  
  if (breakdown.skills < 70) {
    suggestions.push('Include more relevant technical and soft skills');
  }
  
  if (breakdown.education < 70 && resume.education.length === 0) {
    suggestions.push('Consider adding your educational background');
  }
  
  if (resume.personalInfo.summary.length < 50) {
    suggestions.push('Write a compelling professional summary highlighting your key strengths');
  }
  
  if (suggestions.length === 0) {
    suggestions.push('Your resume looks good! Consider tailoring it for specific job descriptions');
  }
  
  return suggestions;
}

function calculateBreakdown(resume: Resume, aiKeywords: string[], overallScore: number): ATSScore['breakdown'] {
  const resumeText = extractResumeText(resume).toLowerCase();
  
  // Keywords score based on AI-suggested keywords
  const foundKeywords = aiKeywords.filter(keyword => 
    resumeText.includes(keyword.toLowerCase())
  );
  const keywordScore = aiKeywords.length > 0 
    ? Math.min((foundKeywords.length / aiKeywords.length) * 100, 100)
    : analyzeKeywords(resume);
  
  // Calculate other scores based on resume content
  const formattingScore = analyzeFormatting(resume);
  const experienceScore = analyzeExperience(resume);
  const educationScore = analyzeEducation(resume);
  const skillsScore = analyzeSkills(resume);
  
  // Adjust scores to align with overall AI score
  const calculatedAverage = (keywordScore * 0.3 + formattingScore * 0.2 + 
                           experienceScore * 0.25 + educationScore * 0.1 + skillsScore * 0.15);
  
  if (calculatedAverage === 0) {
    return {
      keywords: keywordScore,
      formatting: formattingScore,
      experience: experienceScore,
      education: educationScore,
      skills: skillsScore
    };
  }
  
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
  let score = 0;
  
  // Check for essential contact information
  if (resume.personalInfo.fullName?.trim()) score += 20;
  if (resume.personalInfo.email?.trim()) score += 20;
  if (resume.personalInfo.phone?.trim()) score += 15;
  if (resume.personalInfo.location?.trim()) score += 10;
  
  // Check email format
  if (resume.personalInfo.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(resume.personalInfo.email)) {
      score += 10;
    }
  }
  
  // Check for professional summary
  if (resume.personalInfo.summary?.trim()) score += 15;
  
  // Check for at least one section with content
  if (resume.experience.length > 0 || resume.education.length > 0 || 
      resume.skills.length > 0 || resume.projects.length > 0) {
    score += 10;
  }
  
  return Math.min(score, 100);
}

function analyzeExperience(resume: Resume): number {
  if (resume.experience.length === 0) return 0;
  
  let score = 40; // Base score for having experience
  
  // Bonus for multiple positions
  if (resume.experience.length >= 2) score += 15;
  if (resume.experience.length >= 3) score += 10;
  
  // Check for detailed descriptions
  const hasDescriptions = resume.experience.some(exp => exp.description.length > 0);
  if (hasDescriptions) score += 15;
  
  // Check for quantified achievements
  const hasQuantifiedAchievements = resume.experience.some(exp =>
    exp.achievements.some(achievement =>
      /\d+/.test(achievement) || /%/.test(achievement) || /\$/.test(achievement)
    )
  );
  
  if (hasQuantifiedAchievements) score += 20;
  
  return Math.min(score, 100);
}

function analyzeEducation(resume: Resume): number {
  if (resume.education.length === 0) return 50; // Not always required
  
  let score = 70; // Base score for having education
  
  // Bonus for complete information
  const hasCompleteInfo = resume.education.some(edu => 
    edu.degree && edu.field && edu.institution
  );
  if (hasCompleteInfo) score += 20;
  
  // Bonus for honors/achievements
  const hasHonors = resume.education.some(edu => 
    edu.honors && edu.honors.length > 0
  );
  if (hasHonors) score += 10;
  
  return Math.min(score, 100);
}

function analyzeSkills(resume: Resume): number {
  if (resume.skills.length === 0) return 0;
  
  let score = 40; // Base score for having skills
  
  // Bonus for variety of skills
  const categories = new Set(resume.skills.map(skill => skill.category));
  score += Math.min(categories.size * 15, 40);
  
  // Bonus for technical skills
  const hasTechnicalSkills = resume.skills.some(skill => skill.category === 'technical');
  if (hasTechnicalSkills) score += 20;
  
  return Math.min(score, 100);
}