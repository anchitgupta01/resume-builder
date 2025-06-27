import React, { useRef, useState, useEffect } from 'react';
import { Download, FileText, TrendingUp, AlertCircle, Settings, Loader, ChevronDown, ChevronUp, Key, Plus } from 'lucide-react';
import { Resume, ATSScore } from '../types/resume';
import { analyzeATS } from '../utils/atsAnalyzer';

interface ResumePreviewProps {
  resume: Resume;
}

export function ResumePreview({ resume }: ResumePreviewProps) {
  const resumeRef = useRef<HTMLDivElement>(null);
  const [atsScore, setAtsScore] = useState<ATSScore | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [showJobDescInput, setShowJobDescInput] = useState(false);
  const [isScorePanelCollapsed, setIsScorePanelCollapsed] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  useEffect(() => {
    analyzeResume();
  }, [resume]);

  const analyzeResume = async () => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    try {
      const score = await analyzeATS(resume, jobDescription || undefined);
      setAtsScore(score);
    } catch (error) {
      console.error('Error analyzing resume:', error);
      setAnalysisError(error instanceof Error ? error.message : 'Failed to analyze resume');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleJobDescriptionAnalysis = async () => {
    if (jobDescription.trim()) {
      await analyzeResume();
      setShowJobDescInput(false);
    }
  };

  const downloadPDF = async () => {
    if (!resume) return;

    try {
      setIsGeneratingPDF(true);
      
      // Dynamic import to reduce bundle size
      const jsPDF = (await import('jspdf')).default;

      // Create new PDF document with professional settings
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2);
      let currentY = margin;

      // Professional color scheme
      const primaryColor = [0, 0, 0]; // Black for main text
      const secondaryColor = [60, 60, 60]; // Dark gray for secondary text
      const accentColor = [0, 100, 200]; // Blue for links and accents
      const lineColor = [200, 200, 200]; // Light gray for lines

      // Helper function to add text with word wrapping and professional styling
      const addText = (
        text: string, 
        fontSize: number, 
        fontStyle: 'normal' | 'bold' = 'normal', 
        color: [number, number, number] = primaryColor,
        align: 'left' | 'center' | 'right' = 'left'
      ) => {
        pdf.setFontSize(fontSize);
        pdf.setFont('helvetica', fontStyle);
        pdf.setTextColor(color[0], color[1], color[2]);
        
        const lines = pdf.splitTextToSize(text, contentWidth);
        const lineHeight = fontSize * 0.35; // Convert pt to mm
        
        // Check if we need a new page
        if (currentY + (lines.length * lineHeight) > pageHeight - margin) {
          pdf.addPage();
          currentY = margin;
        }
        
        // Calculate x position based on alignment
        let xPos = margin;
        if (align === 'center') {
          xPos = pageWidth / 2;
        } else if (align === 'right') {
          xPos = pageWidth - margin;
        }
        
        pdf.text(lines, xPos, currentY, { align });
        currentY += lines.length * lineHeight;
        return currentY;
      };

      // Helper function to add spacing
      const addSpacing = (space: number) => {
        currentY += space;
      };

      // Helper function to add a professional section header with line
      const addSectionHeader = (title: string) => {
        addSpacing(6);
        
        // Add the section title
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(0, 0, 0);
        pdf.text(title.toUpperCase(), margin, currentY);
        
        // Add professional underline
        pdf.setDrawColor(lineColor[0], lineColor[1], lineColor[2]);
        pdf.setLineWidth(0.3);
        pdf.line(margin, currentY + 2, pageWidth - margin, currentY + 2);
        
        addSpacing(8);
      };

      // Helper function to add contact info in a professional layout
      const addContactInfo = (items: string[]) => {
        if (items.length === 0) return;
        
        const itemsPerLine = 3;
        const itemWidth = contentWidth / itemsPerLine;
        
        for (let i = 0; i < items.length; i += itemsPerLine) {
          const lineItems = items.slice(i, i + itemsPerLine);
          
          lineItems.forEach((item, index) => {
            const xPos = margin + (index * itemWidth);
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
            
            const lines = pdf.splitTextToSize(item, itemWidth - 5);
            pdf.text(lines, xPos, currentY, { align: index === 1 ? 'center' : 'left' });
          });
          
          currentY += 4;
        }
      };

      // HEADER SECTION - Professional Name and Contact
      if (resume.personalInfo.fullName) {
        // Name in large, bold font
        pdf.setFontSize(22);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(0, 0, 0);
        pdf.text(resume.personalInfo.fullName.toUpperCase(), pageWidth / 2, currentY, { align: 'center' });
        addSpacing(8);
      }

      // Contact Information in organized rows
      const contactInfo = [];
      if (resume.personalInfo.email) contactInfo.push(`📧 ${resume.personalInfo.email}`);
      if (resume.personalInfo.phone) contactInfo.push(`📞 ${resume.personalInfo.phone}`);
      if (resume.personalInfo.location) contactInfo.push(`📍 ${resume.personalInfo.location}`);
      
      if (contactInfo.length > 0) {
        addContactInfo(contactInfo);
        addSpacing(2);
      }

      // Professional Links
      const links = [];
      if (resume.personalInfo.linkedin) links.push(`LinkedIn: ${resume.personalInfo.linkedin}`);
      if (resume.personalInfo.github) links.push(`GitHub: ${resume.personalInfo.github}`);
      if (resume.personalInfo.website) links.push(`Portfolio: ${resume.personalInfo.website}`);
      
      if (links.length > 0) {
        links.forEach(link => {
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
          pdf.text(link, pageWidth / 2, currentY, { align: 'center' });
          currentY += 3;
        });
        addSpacing(4);
      }

      // Add a subtle separator line
      pdf.setDrawColor(lineColor[0], lineColor[1], lineColor[2]);
      pdf.setLineWidth(0.5);
      pdf.line(margin + 20, currentY, pageWidth - margin - 20, currentY);
      addSpacing(6);

      // PROFESSIONAL SUMMARY
      if (resume.personalInfo.summary) {
        addSectionHeader('Professional Summary');
        
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        
        const summaryLines = pdf.splitTextToSize(resume.personalInfo.summary, contentWidth);
        pdf.text(summaryLines, margin, currentY);
        currentY += summaryLines.length * 4;
      }

      // WORK EXPERIENCE
      if (resume.experience.length > 0) {
        addSectionHeader('Professional Experience');
        
        resume.experience.forEach((exp, index) => {
          if (index > 0) addSpacing(6);
          
          // Job title and company in professional layout
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(0, 0, 0);
          pdf.text(exp.position, margin, currentY);
          
          // Company name on the same line, right-aligned
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
          pdf.text(exp.company, pageWidth - margin, currentY, { align: 'right' });
          addSpacing(4);
          
          // Dates
          const dateText = `${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}`;
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'italic');
          pdf.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
          pdf.text(dateText, pageWidth - margin, currentY, { align: 'right' });
          addSpacing(5);
          
          // Responsibilities with professional bullet points
          if (exp.description.length > 0) {
            exp.description.forEach(desc => {
              pdf.setFontSize(10);
              pdf.setFont('helvetica', 'normal');
              pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
              
              const bulletText = `• ${desc}`;
              const lines = pdf.splitTextToSize(bulletText, contentWidth - 5);
              pdf.text(lines, margin + 3, currentY);
              currentY += lines.length * 3.5;
            });
          }
          
          // Achievements with emphasis
          if (exp.achievements.length > 0) {
            exp.achievements.forEach(achievement => {
              pdf.setFontSize(10);
              pdf.setFont('helvetica', 'normal');
              pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
              
              const bulletText = `• ${achievement}`;
              const lines = pdf.splitTextToSize(bulletText, contentWidth - 5);
              pdf.text(lines, margin + 3, currentY);
              currentY += lines.length * 3.5;
            });
          }
        });
      }

      // EDUCATION
      if (resume.education.length > 0) {
        addSectionHeader('Education');
        
        resume.education.forEach((edu, index) => {
          if (index > 0) addSpacing(4);
          
          // Degree and institution
          pdf.setFontSize(11);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(0, 0, 0);
          pdf.text(`${edu.degree} in ${edu.field}`, margin, currentY);
          
          // Graduation date on the right
          if (edu.graduationDate) {
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
            pdf.text(edu.graduationDate, pageWidth - margin, currentY, { align: 'right' });
          }
          addSpacing(3);
          
          // Institution
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
          pdf.text(edu.institution, margin, currentY);
          addSpacing(3);
          
          // GPA and honors
          const details = [];
          if (edu.gpa) details.push(`GPA: ${edu.gpa}`);
          if (edu.honors && edu.honors.length > 0) details.push(`Honors: ${edu.honors.join(', ')}`);
          
          if (details.length > 0) {
            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'italic');
            pdf.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
            pdf.text(details.join(' | '), margin, currentY);
            addSpacing(3);
          }
        });
      }

      // SKILLS - Professional categorized layout
      if (resume.skills.length > 0) {
        addSectionHeader('Core Competencies');
        
        const skillsByCategory = resume.skills.reduce((acc, skill) => {
          if (!acc[skill.category]) acc[skill.category] = [];
          acc[skill.category].push(skill.name);
          return acc;
        }, {} as Record<string, string[]>);

        Object.entries(skillsByCategory).forEach(([category, skills]) => {
          const categoryName = category === 'technical' ? 'Technical Skills' : 
                             category === 'soft' ? 'Soft Skills' :
                             category === 'language' ? 'Languages' : 'Certifications';
          
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(0, 0, 0);
          pdf.text(`${categoryName}:`, margin, currentY);
          addSpacing(3);
          
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
          
          const skillsText = skills.join(' • ');
          const lines = pdf.splitTextToSize(skillsText, contentWidth - 10);
          pdf.text(lines, margin + 5, currentY);
          currentY += lines.length * 3.5;
          addSpacing(2);
        });
      }

      // PROJECTS
      if (resume.projects.length > 0) {
        addSectionHeader('Notable Projects');
        
        resume.projects.forEach((project, index) => {
          if (index > 0) addSpacing(5);
          
          // Project name
          pdf.setFontSize(11);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(0, 0, 0);
          pdf.text(project.name, margin, currentY);
          addSpacing(3);
          
          // Description
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
          
          const descLines = pdf.splitTextToSize(project.description, contentWidth);
          pdf.text(descLines, margin, currentY);
          currentY += descLines.length * 3.5;
          addSpacing(2);
          
          // Technologies
          if (project.technologies.length > 0) {
            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
            pdf.text('Technologies:', margin, currentY);
            
            pdf.setFont('helvetica', 'normal');
            const techText = project.technologies.join(', ');
            const techLines = pdf.splitTextToSize(techText, contentWidth - 25);
            pdf.text(techLines, margin + 25, currentY);
            currentY += techLines.length * 3;
          }
          
          // Project links
          const projectLinks = [];
          if (project.link) projectLinks.push(`Demo: ${project.link}`);
          if (project.github) projectLinks.push(`GitHub: ${project.github}`);
          
          if (projectLinks.length > 0) {
            addSpacing(1);
            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
            pdf.text(projectLinks.join(' | '), margin, currentY);
            addSpacing(3);
          }
        });
      }

      // Professional footer
      addSpacing(10);
      pdf.setDrawColor(lineColor[0], lineColor[1], lineColor[2]);
      pdf.setLineWidth(0.3);
      pdf.line(margin, currentY, pageWidth - margin, currentY);
      
      addSpacing(3);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'italic');
      pdf.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      pdf.text('Generated by AI Resume Builder', pageWidth / 2, currentY, { align: 'center' });

      // Save the PDF with professional naming
      const fileName = `${resume.personalInfo.fullName?.replace(/\s+/g, '_') || 'Professional_Resume'}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    if (score >= 40) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900/20';
    if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-900/20';
    if (score >= 40) return 'bg-orange-100 dark:bg-orange-900/20';
    return 'bg-red-100 dark:bg-red-900/20';
  };

  const getScoreMessage = (score: number) => {
    if (score === 0) return 'Start building your resume';
    if (score < 40) return 'Needs significant improvement';
    if (score < 60) return 'Good foundation, needs refinement';
    if (score < 80) return 'Strong resume, minor improvements needed';
    return 'Excellent ATS compatibility';
  };

  const isResumeEmpty = () => {
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
  };

  const hasApiKey = !!import.meta.env.VITE_OPENAI_API_KEY;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 lg:gap-8">
        {/* ATS Score Panel */}
        <div className="lg:col-span-1 order-2 lg:order-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 lg:sticky lg:top-6">
            {/* Mobile Collapsible Header */}
            <div className="lg:hidden">
              <button
                onClick={() => setIsScorePanelCollapsed(!isScorePanelCollapsed)}
                className="w-full p-4 flex items-center justify-between text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">ATS Score</h3>
                  {atsScore && (
                    <span className={`text-lg font-bold ${getScoreColor(atsScore.overall)}`}>
                      {atsScore.overall}
                    </span>
                  )}
                </div>
                {isScorePanelCollapsed ? (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                )}
              </button>
            </div>

            {/* Desktop Header */}
            <div className="hidden lg:flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">ATS Score</h3>
              </div>
              {hasApiKey && !isResumeEmpty() && (
                <button
                  onClick={() => setShowJobDescInput(!showJobDescInput)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  title="Analyze against job description"
                >
                  <Settings className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Panel Content */}
            <div className={`${isScorePanelCollapsed ? 'hidden' : 'block'} lg:block p-4 sm:p-6`}>
              {/* Empty Resume Notice */}
              {isResumeEmpty() && (
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center space-x-3">
                    <Plus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <div>
                      <h4 className="font-medium text-blue-900 dark:text-blue-100">Start Building Your Resume</h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                        Add your personal information, work experience, and skills to see your ATS compatibility score.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* API Key Required Notice */}
              {!hasApiKey && !isResumeEmpty() && (
                <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center space-x-3">
                    <Key className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    <div>
                      <h4 className="font-medium text-amber-900 dark:text-amber-100">Enhanced Analysis Available</h4>
                      <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                        Add your OpenAI API key to enable AI-powered ATS analysis with personalized insights and recommendations.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Job Description Input */}
              {showJobDescInput && hasApiKey && !isResumeEmpty() && (
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Job Description (Optional)
                  </label>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the job description here for targeted analysis..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    rows={4}
                  />
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-3">
                    <button
                      onClick={handleJobDescriptionAnalysis}
                      disabled={isAnalyzing}
                      className="flex-1 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isAnalyzing ? 'Analyzing...' : 'Analyze'}
                    </button>
                    <button
                      onClick={() => setShowJobDescInput(false)}
                      className="flex-1 px-3 py-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded hover:bg-gray-400 dark:hover:bg-gray-500"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Analysis Error */}
              {analysisError && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                    <div>
                      <h4 className="font-medium text-red-900 dark:text-red-100">Analysis Error</h4>
                      <p className="text-sm text-red-700 dark:text-red-300 mt-1">{analysisError}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {isAnalyzing && (
                <div className="mb-6 text-center">
                  <Loader className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600 dark:text-blue-400" />
                  <p className="text-gray-600 dark:text-gray-400">AI is analyzing your resume...</p>
                </div>
              )}

              {/* ATS Score Results */}
              {atsScore && !isAnalyzing && (
                <>
                  {/* Overall Score */}
                  <div className="text-center mb-6">
                    <div className={`inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full ${getScoreBgColor(atsScore.overall)} mb-3`}>
                      <span className={`text-2xl sm:text-3xl font-bold ${getScoreColor(atsScore.overall)}`}>
                        {atsScore.overall}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Overall ATS Compatibility</p>
                    <p className={`text-xs mt-1 font-medium ${getScoreColor(atsScore.overall)}`}>
                      {getScoreMessage(atsScore.overall)}
                    </p>
                    {jobDescription && atsScore.overall > 0 && (
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Analyzed against job description</p>
                    )}
                  </div>

                  {/* Score Breakdown - Only show if resume has content */}
                  {atsScore.overall > 0 && (
                    <div className="space-y-3 sm:space-y-4 mb-6">
                      <h4 className="font-medium text-gray-900 dark:text-white">Score Breakdown</h4>
                      {Object.entries(atsScore.breakdown).map(([category, score]) => (
                        <div key={category} className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                            {category === 'keywords' ? 'Keywords' : category}
                          </span>
                          <div className="flex items-center space-x-2">
                            <div className="w-12 sm:w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : score >= 40 ? 'bg-orange-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${score}%` }}
                              />
                            </div>
                            <span className={`text-sm font-medium ${getScoreColor(score)} min-w-[2rem]`}>
                              {score}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Suggestions */}
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2 text-orange-500" />
                      {atsScore.overall === 0 ? 'Getting Started' : 'Improvement Suggestions'}
                    </h4>
                    <ul className="space-y-2">
                      {atsScore.suggestions.map((suggestion, index) => (
                        <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start">
                          <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Missing Keywords - Only show if there are any */}
                  {atsScore.missingKeywords.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">Consider Adding Keywords</h4>
                      <div className="flex flex-wrap gap-2">
                        {atsScore.missingKeywords.slice(0, 8).map((keyword, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 text-xs rounded-full"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Refresh Analysis Button - Only show if resume has content */}
                  {hasApiKey && atsScore.overall > 0 && (
                    <button
                      onClick={analyzeResume}
                      disabled={isAnalyzing}
                      className="w-full mb-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader className="h-4 w-4 animate-spin" />
                          <span>Analyzing...</span>
                        </>
                      ) : (
                        <>
                          <TrendingUp className="h-4 w-4" />
                          <span>Refresh Analysis</span>
                        </>
                      )}
                    </button>
                  )}
                </>
              )}

              {/* Download Button */}
              <button
                onClick={downloadPDF}
                disabled={isResumeEmpty() || isGeneratingPDF}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
              >
                {isGeneratingPDF ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    <span>Generating Professional PDF...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    <span>{isResumeEmpty() ? 'Add Content to Download' : 'Download Professional PDF'}</span>
                  </>
                )}
              </button>
              
              {!isResumeEmpty() && (
                <div className="mt-3 text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    ✨ Professional template with selectable text
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    📄 ATS-optimized formatting
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Resume Preview */}
        <div className="lg:col-span-2 order-1 lg:order-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Resume Preview</h3>
              </div>
            </div>

            <div ref={resumeRef} className="p-4 sm:p-6 lg:p-8 bg-white" style={{ minHeight: '11in' }}>
              {/* Show placeholder content if resume is empty */}
              {isResumeEmpty() ? (
                <div className="text-center py-16">
                  <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-500 mb-2">Your Professional Resume Preview</h3>
                  <p className="text-gray-400 mb-6">Start building your resume to see the professional template preview here</p>
                  <div className="text-left max-w-md mx-auto space-y-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Add your personal information in the Builder tab</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Include your work experience and achievements</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>List your skills and education</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span>Add projects to showcase your work</span>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Professional Header - Wonsulting Style */}
                  <div className="text-center mb-8 border-b-2 border-gray-900 pb-6">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 tracking-wide">
                      {resume.personalInfo.fullName?.toUpperCase() || 'YOUR NAME'}
                    </h1>
                    
                    {/* Contact Information in Professional Layout */}
                    <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-700 mb-2">
                      {resume.personalInfo.location && (
                        <span>{resume.personalInfo.location}</span>
                      )}
                      {resume.personalInfo.email && (
                        <span>|</span>
                      )}
                      {resume.personalInfo.email && (
                        <span>{resume.personalInfo.email}</span>
                      )}
                      {resume.personalInfo.phone && (
                        <span>|</span>
                      )}
                      {resume.personalInfo.phone && (
                        <span>{resume.personalInfo.phone}</span>
                      )}
                    </div>
                    
                    {/* Professional Links */}
                    <div className="flex flex-wrap justify-center gap-4 text-sm text-blue-600">
                      {resume.personalInfo.linkedin && (
                        <a href={resume.personalInfo.linkedin} className="hover:underline">
                          LinkedIn
                        </a>
                      )}
                      {resume.personalInfo.github && (
                        <span>|</span>
                      )}
                      {resume.personalInfo.github && (
                        <a href={resume.personalInfo.github} className="hover:underline">
                          GitHub
                        </a>
                      )}
                      {resume.personalInfo.website && (
                        <span>|</span>
                      )}
                      {resume.personalInfo.website && (
                        <a href={resume.personalInfo.website} className="hover:underline">
                          Portfolio
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Professional Summary */}
                  {resume.personalInfo.summary && (
                    <div className="mb-8">
                      <h2 className="text-lg font-bold text-gray-900 mb-3 border-b border-gray-300 pb-1 uppercase tracking-wide">
                        Professional Summary
                      </h2>
                      <p className="text-gray-700 leading-relaxed text-justify">
                        {resume.personalInfo.summary}
                      </p>
                    </div>
                  )}

                  {/* Work Experience - Professional Layout */}
                  {resume.experience.length > 0 && (
                    <div className="mb-8">
                      <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-300 pb-1 uppercase tracking-wide">
                        Work Experience
                      </h2>
                      <div className="space-y-6">
                        {resume.experience.map((exp) => (
                          <div key={exp.id}>
                            {/* Company and Position Header */}
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="text-base font-bold text-gray-900">
                                  {exp.company}
                                </h3>
                                <p className="text-gray-700 font-semibold italic">
                                  {exp.position}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-gray-600 font-medium">
                                  {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                                </p>
                              </div>
                            </div>
                            
                            {/* Responsibilities and Achievements */}
                            {(exp.description.length > 0 || exp.achievements.length > 0) && (
                              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
                                {exp.description.map((desc, index) => (
                                  <li key={index} className="text-sm leading-relaxed">{desc}</li>
                                ))}
                                {exp.achievements.map((achievement, index) => (
                                  <li key={index} className="text-sm leading-relaxed font-medium">{achievement}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Education */}
                  {resume.education.length > 0 && (
                    <div className="mb-8">
                      <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-300 pb-1 uppercase tracking-wide">
                        Education
                      </h2>
                      <div className="space-y-4">
                        {resume.education.map((edu) => (
                          <div key={edu.id}>
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="text-base font-bold text-gray-900">
                                  {edu.institution}
                                </h3>
                                <p className="text-gray-700 font-semibold italic">
                                  {edu.degree} in {edu.field}
                                </p>
                                {edu.gpa && (
                                  <p className="text-gray-600 text-sm">GPA: {edu.gpa}</p>
                                )}
                              </div>
                              <p className="text-gray-600 font-medium">{edu.graduationDate}</p>
                            </div>
                            
                            {edu.honors && edu.honors.length > 0 && (
                              <ul className="list-disc list-inside text-gray-700 text-sm mt-1 ml-2">
                                {edu.honors.map((honor, index) => (
                                  <li key={index}>{honor}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Skills - Professional Grid Layout */}
                  {resume.skills.length > 0 && (
                    <div className="mb-8">
                      <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-300 pb-1 uppercase tracking-wide">
                        Skills & Interests
                      </h2>
                      <div className="space-y-3">
                        {Object.entries(
                          resume.skills.reduce((acc, skill) => {
                            if (!acc[skill.category]) acc[skill.category] = [];
                            acc[skill.category].push(skill);
                            return acc;
                          }, {} as Record<string, typeof resume.skills>)
                        ).map(([category, skills]) => (
                          <div key={category}>
                            <span className="font-bold text-gray-900 text-sm">
                              {category === 'technical' ? 'Skills:' : 
                               category === 'soft' ? 'Soft Skills:' :
                               category === 'language' ? 'Languages:' : 'Interests:'}
                            </span>
                            <span className="ml-2 text-gray-700 text-sm">
                              {skills.map(skill => skill.name).join(' | ')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Projects */}
                  {resume.projects.length > 0 && (
                    <div className="mb-8">
                      <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-300 pb-1 uppercase tracking-wide">
                        Notable Projects
                      </h2>
                      <div className="space-y-4">
                        {resume.projects.map((project) => (
                          <div key={project.id}>
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="text-base font-bold text-gray-900">
                                {project.name}
                              </h3>
                              <div className="flex space-x-2 text-sm">
                                {project.link && (
                                  <a href={project.link} className="text-blue-600 hover:underline">
                                    Demo
                                  </a>
                                )}
                                {project.github && (
                                  <a href={project.github} className="text-blue-600 hover:underline">
                                    GitHub
                                  </a>
                                )}
                              </div>
                            </div>
                            <p className="text-gray-700 text-sm leading-relaxed mb-2">{project.description}</p>
                            {project.technologies.length > 0 && (
                              <p className="text-gray-600 text-sm">
                                <span className="font-semibold">Technologies:</span> {project.technologies.join(', ')}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}