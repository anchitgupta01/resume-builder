import React, { useRef, useState, useEffect } from 'react';
import { Download, FileText, TrendingUp, AlertCircle, Settings, Loader, ChevronDown, ChevronUp, Key } from 'lucide-react';
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
    if (!resumeRef.current) return;

    try {
      // Dynamic import to reduce bundle size
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;

      const canvas = await html2canvas(resumeRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${resume.personalInfo.fullName || 'resume'}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const hasApiKey = !!import.meta.env.VITE_OPENAI_API_KEY;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 lg:gap-8">
        {/* ATS Score Panel */}
        <div className="lg:col-span-1 order-2 lg:order-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 lg:sticky lg:top-6">
            {/* Mobile Collapsible Header */}
            <div className="lg:hidden">
              <button
                onClick={() => setIsScorePanelCollapsed(!isScorePanelCollapsed)}
                className="w-full p-4 flex items-center justify-between text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">ATS Score</h3>
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
            <div className="hidden lg:flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">ATS Score</h3>
              </div>
              {hasApiKey && (
                <button
                  onClick={() => setShowJobDescInput(!showJobDescInput)}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                  title="Analyze against job description"
                >
                  <Settings className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Panel Content */}
            <div className={`${isScorePanelCollapsed ? 'hidden' : 'block'} lg:block p-4 sm:p-6`}>
              {/* API Key Required Notice */}
              {!hasApiKey && (
                <div className="mb-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-center space-x-3">
                    <Key className="h-5 w-5 text-amber-600" />
                    <div>
                      <h4 className="font-medium text-amber-900">OpenAI API Key Required</h4>
                      <p className="text-sm text-amber-700 mt-1">
                        Add your OpenAI API key to enable AI-powered ATS analysis with personalized insights and recommendations.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Job Description Input */}
              {showJobDescInput && hasApiKey && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Description (Optional)
                  </label>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the job description here for targeted analysis..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
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
                      className="flex-1 px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Analysis Error */}
              {analysisError && (
                <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <div>
                      <h4 className="font-medium text-red-900">Analysis Error</h4>
                      <p className="text-sm text-red-700 mt-1">{analysisError}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {isAnalyzing && (
                <div className="mb-6 text-center">
                  <Loader className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                  <p className="text-gray-600">AI is analyzing your resume...</p>
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
                    <p className="text-gray-600 text-sm sm:text-base">Overall ATS Compatibility</p>
                    {jobDescription && (
                      <p className="text-xs text-blue-600 mt-1">Analyzed against job description</p>
                    )}
                  </div>

                  {/* Score Breakdown */}
                  <div className="space-y-3 sm:space-y-4 mb-6">
                    <h4 className="font-medium text-gray-900">Score Breakdown</h4>
                    {Object.entries(atsScore.breakdown).map(([category, score]) => (
                      <div key={category} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 capitalize">
                          {category === 'keywords' ? 'Keywords' : category}
                        </span>
                        <div className="flex items-center space-x-2">
                          <div className="w-12 sm:w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
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

                  {/* Suggestions */}
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2 text-orange-500" />
                      AI Suggestions
                    </h4>
                    <ul className="space-y-2">
                      {atsScore.suggestions.map((suggestion, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start">
                          <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Missing Keywords */}
                  {atsScore.missingKeywords.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-medium text-gray-900 mb-3">Consider Adding Keywords</h4>
                      <div className="flex flex-wrap gap-2">
                        {atsScore.missingKeywords.slice(0, 8).map((keyword, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Refresh Analysis Button */}
                  {hasApiKey && (
                    <button
                      onClick={analyzeResume}
                      disabled={isAnalyzing}
                      className="w-full mb-3 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
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
                className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </div>

        {/* Resume Preview */}
        <div className="lg:col-span-2 order-1 lg:order-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-gray-600" />
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Resume Preview</h3>
              </div>
            </div>

            <div ref={resumeRef} className="p-4 sm:p-6 lg:p-8 bg-white" style={{ minHeight: '11in' }}>
              {/* Header */}
              <div className="text-center mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  {resume.personalInfo.fullName || 'Your Name'}
                </h1>
                <div className="flex flex-wrap justify-center gap-2 sm:gap-4 text-sm text-gray-600">
                  {resume.personalInfo.email && (
                    <span className="break-all">{resume.personalInfo.email}</span>
                  )}
                  {resume.personalInfo.phone && (
                    <span>{resume.personalInfo.phone}</span>
                  )}
                  {resume.personalInfo.location && (
                    <span>{resume.personalInfo.location}</span>
                  )}
                </div>
                <div className="flex flex-wrap justify-center gap-2 sm:gap-4 text-sm text-blue-600 mt-2">
                  {resume.personalInfo.linkedin && (
                    <a href={resume.personalInfo.linkedin} className="hover:underline break-all">
                      LinkedIn
                    </a>
                  )}
                  {resume.personalInfo.github && (
                    <a href={resume.personalInfo.github} className="hover:underline break-all">
                      GitHub
                    </a>
                  )}
                  {resume.personalInfo.website && (
                    <a href={resume.personalInfo.website} className="hover:underline break-all">
                      Portfolio
                    </a>
                  )}
                </div>
              </div>

              {/* Professional Summary */}
              {resume.personalInfo.summary && (
                <div className="mb-6 sm:mb-8">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 border-b-2 border-gray-300 pb-1">
                    Professional Summary
                  </h2>
                  <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                    {resume.personalInfo.summary}
                  </p>
                </div>
              )}

              {/* Experience */}
              {resume.experience.length > 0 && (
                <div className="mb-6 sm:mb-8">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 border-b-2 border-gray-300 pb-1">
                    Professional Experience
                  </h2>
                  <div className="space-y-4 sm:space-y-6">
                    {resume.experience.map((exp) => (
                      <div key={exp.id}>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2">
                          <div className="mb-1 sm:mb-0">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                              {exp.position}
                            </h3>
                            <p className="text-gray-700 font-medium">{exp.company}</p>
                          </div>
                          <p className="text-gray-600 text-sm flex-shrink-0">
                            {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                          </p>
                        </div>
                        
                        {exp.description.length > 0 && (
                          <ul className="list-disc list-inside text-gray-700 space-y-1 mb-2 text-sm sm:text-base">
                            {exp.description.map((desc, index) => (
                              <li key={index}>{desc}</li>
                            ))}
                          </ul>
                        )}
                        
                        {exp.achievements.length > 0 && (
                          <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm sm:text-base">
                            {exp.achievements.map((achievement, index) => (
                              <li key={index} className="font-medium">{achievement}</li>
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
                <div className="mb-6 sm:mb-8">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 border-b-2 border-gray-300 pb-1">
                    Education
                  </h2>
                  <div className="space-y-4">
                    {resume.education.map((edu) => (
                      <div key={edu.id}>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                          <div>
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                              {edu.degree} in {edu.field}
                            </h3>
                            <p className="text-gray-700">{edu.institution}</p>
                            {edu.gpa && (
                              <p className="text-gray-600 text-sm">GPA: {edu.gpa}</p>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm mt-1 sm:mt-0">{edu.graduationDate}</p>
                        </div>
                        
                        {edu.honors && edu.honors.length > 0 && (
                          <ul className="list-disc list-inside text-gray-700 text-sm mt-1">
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

              {/* Skills */}
              {resume.skills.length > 0 && (
                <div className="mb-6 sm:mb-8">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 border-b-2 border-gray-300 pb-1">
                    Skills
                  </h2>
                  <div className="grid grid-cols-1 gap-4">
                    {Object.entries(
                      resume.skills.reduce((acc, skill) => {
                        if (!acc[skill.category]) acc[skill.category] = [];
                        acc[skill.category].push(skill);
                        return acc;
                      }, {} as Record<string, typeof resume.skills>)
                    ).map(([category, skills]) => (
                      <div key={category}>
                        <h3 className="font-semibold text-gray-900 mb-2 capitalize text-sm sm:text-base">
                          {category === 'technical' ? 'Technical Skills' : 
                           category === 'soft' ? 'Soft Skills' :
                           category === 'language' ? 'Languages' : 'Certifications'}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {skills.map((skill) => (
                            <span
                              key={skill.id}
                              className="px-2 py-1 bg-gray-100 text-gray-800 text-xs sm:text-sm rounded"
                            >
                              {skill.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {resume.projects.length > 0 && (
                <div className="mb-6 sm:mb-8">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 border-b-2 border-gray-300 pb-1">
                    Projects
                  </h2>
                  <div className="space-y-4">
                    {resume.projects.map((project) => (
                      <div key={project.id}>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-0">
                            {project.name}
                          </h3>
                          <div className="flex flex-wrap gap-2 text-sm">
                            {project.link && (
                              <a
                                href={project.link}
                                className="text-blue-600 hover:underline"
                              >
                                Live Demo
                              </a>
                            )}
                            {project.github && (
                              <a
                                href={project.github}
                                className="text-blue-600 hover:underline"
                              >
                                GitHub
                              </a>
                            )}
                          </div>
                        </div>
                        <p className="text-gray-700 mb-2 text-sm sm:text-base">{project.description}</p>
                        {project.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {project.technologies.map((tech, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}