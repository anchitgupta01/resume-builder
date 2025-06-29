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

      // Create new PDF document with A4 size
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      let currentY = margin;

      // Colors matching the template
      const primaryColor = [0, 0, 0]; // Black
      const grayColor = [100, 100, 100]; // Gray for secondary text
      const lightGrayColor = [150, 150, 150]; // Light gray for lines
      const accentColor = [59, 130, 246]; // Blue accent

      // Helper function to add text with word wrapping
      const addText = (
        text: string, 
        x: number,
        y: number,
        maxWidth: number,
        fontSize: number, 
        fontStyle: 'normal' | 'bold' | 'italic' = 'normal', 
        color: [number, number, number] = primaryColor,
        align: 'left' | 'center' | 'right' = 'left'
      ) => {
        if (!text || text.trim() === '') return y;
        
        pdf.setFontSize(fontSize);
        pdf.setFont('helvetica', fontStyle);
        pdf.setTextColor(color[0], color[1], color[2]);
        
        const lines = pdf.splitTextToSize(text, maxWidth);
        const lineHeight = fontSize * 0.35;
        
        // Check if we need a new page
        if (y + (lines.length * lineHeight) > pageHeight - margin) {
          pdf.addPage();
          y = margin;
        }
        
        pdf.text(lines, x, y, { align });
        return y + (lines.length * lineHeight);
      };

      // Helper function to add section header with underline
      const addSectionHeader = (title: string, y: number) => {
        if (y + 15 > pageHeight - margin) {
          pdf.addPage();
          y = margin;
        }
        
        y = addText(title.toUpperCase(), margin, y, contentWidth, 11, 'bold', primaryColor);
        
        // Add underline
        pdf.setDrawColor(lightGrayColor[0], lightGrayColor[1], lightGrayColor[2]);
        pdf.setLineWidth(0.5);
        pdf.line(margin, y + 2, pageWidth - margin, y + 2);
        
        return y + 8;
      };

      // HEADER SECTION - Centered like the template
      if (resume.personalInfo.fullName) {
        currentY = addText(resume.personalInfo.fullName.toUpperCase(), pageWidth / 2, currentY + 10, contentWidth, 20, 'bold', primaryColor, 'center');
        currentY += 3;
      }

      // Job title from first experience (like the template)
      if (resume.experience.length > 0) {
        currentY = addText(resume.experience[0].position, pageWidth / 2, currentY, contentWidth, 12, 'normal', accentColor, 'center');
        currentY += 8;
      }

      // Contact information - centered, clean format like template
      const contactInfo = [];
      if (resume.personalInfo.email) contactInfo.push(resume.personalInfo.email);
      if (resume.personalInfo.phone) contactInfo.push(resume.personalInfo.phone);
      if (resume.personalInfo.location) contactInfo.push(resume.personalInfo.location);

      if (contactInfo.length > 0) {
        const contactText = contactInfo.join(' | ');
        currentY = addText(contactText, pageWidth / 2, currentY, contentWidth, 10, 'normal', grayColor, 'center');
        currentY += 3;
      }

      // Professional links
      if (resume.personalInfo.linkedin) {
        currentY = addText(resume.personalInfo.linkedin, pageWidth / 2, currentY, contentWidth, 10, 'normal', accentColor, 'center');
        currentY += 12;
      } else {
        currentY += 8;
      }

      // SUMMARY/PROFILE (if exists)
      if (resume.personalInfo.summary && resume.personalInfo.summary.trim()) {
        currentY = addText(resume.personalInfo.summary, margin, currentY, contentWidth, 11, 'normal', primaryColor);
        currentY += 12;
      }

      // WORK EXPERIENCE
      if (resume.experience.length > 0) {
        currentY = addSectionHeader('Work Experience', currentY);
        
        resume.experience.forEach((exp, index) => {
          if (index > 0) currentY += 8;
          
          // Check if we need a new page for this experience
          if (currentY + 30 > pageHeight - margin) {
            pdf.addPage();
            currentY = margin;
          }
          
          // Job title - bold, left aligned
          currentY = addText(exp.position, margin, currentY, contentWidth * 0.7, 12, 'bold', primaryColor);
          
          // Date range - right aligned (like template)
          const dateText = `${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}`;
          addText(dateText, pageWidth - margin, currentY - 4, 50, 10, 'normal', grayColor, 'right');
          currentY += 2;
          
          // Company name - italic, gray (like template)
          currentY = addText(exp.company, margin, currentY, contentWidth, 11, 'italic', grayColor);
          currentY += 4;
          
          // Description and achievements as bullet points
          const allPoints = [...exp.description, ...exp.achievements];
          allPoints.forEach(point => {
            if (point && point.trim()) {
              currentY = addText(`• ${point}`, margin + 5, currentY, contentWidth - 5, 10, 'normal', primaryColor);
              currentY += 2;
            }
          });
          
          currentY += 3;
        });
        
        currentY += 5;
      }

      // CORE SKILLS (like template - as paragraph)
      if (resume.skills.length > 0) {
        currentY = addSectionHeader('Core Skills', currentY);
        
        // Combine all skills into one paragraph (like template)
        const allSkills = resume.skills.map(skill => skill.name);
        const skillsText = allSkills.join(', ');
        
        currentY = addText(skillsText, margin, currentY, contentWidth, 11, 'normal', primaryColor);
        currentY += 10;
      }

      // EDUCATION
      if (resume.education.length > 0) {
        currentY = addSectionHeader('Education', currentY);
        
        resume.education.forEach((edu, index) => {
          if (index > 0) currentY += 6;
          
          // Check if we need a new page
          if (currentY + 20 > pageHeight - margin) {
            pdf.addPage();
            currentY = margin;
          }
          
          // Institution name - bold
          currentY = addText(edu.institution, margin, currentY, contentWidth * 0.7, 12, 'bold', primaryColor);
          
          // Graduation date - right aligned (like template)
          if (edu.graduationDate) {
            addText(edu.graduationDate, pageWidth - margin, currentY - 4, 50, 10, 'normal', grayColor, 'right');
          }
          currentY += 2;
          
          // Degree and field - italic (like template)
          const degreeText = `${edu.degree}${edu.field ? ` ${edu.field}` : ''}`;
          currentY = addText(degreeText, margin, currentY, contentWidth, 11, 'italic', grayColor);
          
          // GPA and honors
          const details = [];
          if (edu.gpa) details.push(`GPA: ${edu.gpa}`);
          if (edu.honors && edu.honors.length > 0) details.push(edu.honors.join(', '));
          
          if (details.length > 0) {
            currentY += 2;
            currentY = addText(details.join(' | '), margin, currentY, contentWidth, 10, 'normal', grayColor);
          }
          
          currentY += 4;
        });
        
        currentY += 5;
      }

      // PROJECTS (if any)
      if (resume.projects.length > 0) {
        currentY = addSectionHeader('Projects', currentY);
        
        resume.projects.forEach((project, index) => {
          if (index > 0) currentY += 6;
          
          // Check if we need a new page
          if (currentY + 25 > pageHeight - margin) {
            pdf.addPage();
            currentY = margin;
          }
          
          // Project name - bold
          currentY = addText(project.name, margin, currentY, contentWidth, 12, 'bold', primaryColor);
          currentY += 2;
          
          // Description
          currentY = addText(project.description, margin, currentY, contentWidth, 10, 'normal', primaryColor);
          currentY += 2;
          
          // Technologies
          if (project.technologies.length > 0) {
            const techText = `Technologies: ${project.technologies.join(', ')}`;
            currentY = addText(techText, margin, currentY, contentWidth, 10, 'italic', grayColor);
            currentY += 2;
          }
          
          // Links
          const links = [];
          if (project.link) links.push(`Demo: ${project.link}`);
          if (project.github) links.push(`GitHub: ${project.github}`);
          
          if (links.length > 0) {
            currentY = addText(links.join(' | '), margin, currentY, contentWidth, 9, 'normal', accentColor);
          }
          
          currentY += 4;
        });
      }

      // Save the PDF with proper filename
      const fileName = `${resume.personalInfo.fullName?.replace(/\s+/g, '_') || 'Resume'}.pdf`;
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
                    ✨ Clean professional template matching your reference
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    📄 ATS-optimized formatting with smart spacing
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
                  {/* Professional Header - Centered like the template */}
                  <div className="text-center mb-8 pb-6">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 tracking-wide">
                      {resume.personalInfo.fullName?.toUpperCase() || 'YOUR NAME'}
                    </h1>
                    
                    {/* Job title from experience */}
                    {resume.experience.length > 0 && (
                      <p className="text-lg text-blue-600 mb-4">
                        {resume.experience[0].position}
                      </p>
                    )}
                    
                    {/* Contact Information - centered and clean */}
                    <div className="text-sm text-gray-600 space-y-1">
                      {resume.personalInfo.email && (
                        <div>{resume.personalInfo.email}</div>
                      )}
                      {resume.personalInfo.phone && resume.personalInfo.location && (
                        <div>{resume.personalInfo.phone} | {resume.personalInfo.location}</div>
                      )}
                      {resume.personalInfo.phone && !resume.personalInfo.location && (
                        <div>{resume.personalInfo.phone}</div>
                      )}
                      {!resume.personalInfo.phone && resume.personalInfo.location && (
                        <div>{resume.personalInfo.location}</div>
                      )}
                      {resume.personalInfo.linkedin && (
                        <div className="text-blue-600">{resume.personalInfo.linkedin}</div>
                      )}
                    </div>
                  </div>

                  {/* Professional Summary */}
                  {resume.personalInfo.summary && (
                    <div className="mb-8">
                      <p className="text-gray-700 leading-relaxed text-justify">
                        {resume.personalInfo.summary}
                      </p>
                    </div>
                  )}

                  {/* Work Experience */}
                  {resume.experience.length > 0 && (
                    <div className="mb-8">
                      <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-300 pb-1 uppercase tracking-wide">
                        Work Experience
                      </h2>
                      <div className="space-y-6">
                        {resume.experience.map((exp) => (
                          <div key={exp.id}>
                            {/* Job title and dates */}
                            <div className="flex justify-between items-start mb-1">
                              <h3 className="text-base font-bold text-gray-900">
                                {exp.position}
                              </h3>
                              <span className="text-gray-600 text-sm">
                                {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                              </span>
                            </div>
                            
                            {/* Company name */}
                            <p className="text-gray-600 italic mb-3">
                              {exp.company}
                            </p>
                            
                            {/* Responsibilities and Achievements */}
                            {(exp.description.length > 0 || exp.achievements.length > 0) && (
                              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
                                {exp.description.map((desc, index) => (
                                  <li key={index} className="text-sm leading-relaxed">{desc}</li>
                                ))}
                                {exp.achievements.map((achievement, index) => (
                                  <li key={index} className="text-sm leading-relaxed">{achievement}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Core Skills */}
                  {resume.skills.length > 0 && (
                    <div className="mb-8">
                      <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-300 pb-1 uppercase tracking-wide">
                        Core Skills
                      </h2>
                      <div className="text-gray-700">
                        {resume.skills.map(skill => skill.name).join(', ')}
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
                                <p className="text-gray-600 italic">
                                  {edu.degree}{edu.field ? ` ${edu.field}` : ''}
                                </p>
                              </div>
                              {edu.graduationDate && (
                                <span className="text-gray-600 text-sm">{edu.graduationDate}</span>
                              )}
                            </div>
                            
                            {(edu.gpa || (edu.honors && edu.honors.length > 0)) && (
                              <div className="mt-1 text-sm text-gray-600">
                                {edu.gpa && <span>GPA: {edu.gpa}</span>}
                                {edu.gpa && edu.honors && edu.honors.length > 0 && <span> | </span>}
                                {edu.honors && edu.honors.length > 0 && <span>{edu.honors.join(', ')}</span>}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Projects */}
                  {resume.projects.length > 0 && (
                    <div className="mb-8">
                      <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-300 pb-1 uppercase tracking-wide">
                        Projects
                      </h2>
                      <div className="space-y-4">
                        {resume.projects.map((project) => (
                          <div key={project.id}>
                            <h3 className="text-base font-bold text-gray-900 mb-1">
                              {project.name}
                            </h3>
                            <p className="text-gray-700 text-sm leading-relaxed mb-2">{project.description}</p>
                            {project.technologies.length > 0 && (
                              <p className="text-gray-600 text-sm italic">
                                Technologies: {project.technologies.join(', ')}
                              </p>
                            )}
                            {(project.link || project.github) && (
                              <div className="text-sm text-blue-600 mt-1">
                                {project.link && (
                                  <a href={project.link} className="hover:underline mr-4">
                                    Demo: {project.link}
                                  </a>
                                )}
                                {project.github && (
                                  <a href={project.github} className="hover:underline">
                                    GitHub: {project.github}
                                  </a>
                                )}
                              </div>
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