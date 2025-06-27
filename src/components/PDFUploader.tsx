import React, { useState, useRef } from 'react';
import { Upload, FileText, Loader, AlertCircle, CheckCircle, X } from 'lucide-react';
import { Resume } from '../types/resume';
import { processResumeUpload } from '../utils/pdfExtractor';

interface PDFUploaderProps {
  onResumeExtracted: (resume: Resume) => void;
  onClose: () => void;
}

export function PDFUploader({ onResumeExtracted, onClose }: PDFUploaderProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setIsProcessing(true);
    setError(null);

    try {
      const resumeData = await processResumeUpload(file);
      onResumeExtracted(resumeData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while processing the file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const hasApiKey = !!import.meta.env.VITE_OPENAI_API_KEY;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
                <Upload className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Upload Resume PDF
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Extract and import your resume data
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {!hasApiKey ? (
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                OpenAI API Key Required
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                PDF text extraction and parsing requires an OpenAI API key to intelligently extract and organize your resume data.
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Add your OpenAI API key to your environment variables to enable this feature.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Upload Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                } ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                {isProcessing ? (
                  <div className="space-y-4">
                    <Loader className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto animate-spin" />
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Processing Your Resume
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                        Extracting text and parsing resume data with AI...
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto" />
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Drop your PDF here
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                        or click to browse files
                      </p>
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Choose File
                    </button>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      PDF files only, max 10MB
                    </p>
                  </div>
                )}
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* Error Message */}
              {error && (
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-red-900 dark:text-red-100">Upload Error</h4>
                      <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* How it works */}
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">How it works:</h4>
                <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>1. Upload your existing resume PDF</li>
                  <li>2. AI extracts and analyzes the text content</li>
                  <li>3. Resume data is automatically organized into sections</li>
                  <li>4. Review and edit the imported information</li>
                </ol>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}