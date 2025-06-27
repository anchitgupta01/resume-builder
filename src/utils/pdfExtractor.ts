import * as pdfjsLib from 'pdfjs-dist';
import { Resume } from '../types/resume';
import { openaiService } from './openaiService';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    
    // Extract text from all pages
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      fullText += pageText + '\n';
    }
    
    return fullText.trim();
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF. Please ensure the file is a valid PDF document.');
  }
}

export async function parseResumeFromText(extractedText: string): Promise<Resume> {
  try {
    const parsedData = await openaiService.parseResumeText(extractedText);
    return parsedData;
  } catch (error) {
    console.error('Error parsing resume text:', error);
    throw new Error('Failed to parse resume content. Please ensure your OpenAI API key is configured correctly.');
  }
}

export async function processResumeUpload(file: File): Promise<Resume> {
  // Validate file type
  if (file.type !== 'application/pdf') {
    throw new Error('Please upload a PDF file only.');
  }
  
  // Validate file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('File size must be less than 10MB.');
  }
  
  // Extract text from PDF
  const extractedText = await extractTextFromPDF(file);
  
  if (!extractedText || extractedText.length < 50) {
    throw new Error('Could not extract sufficient text from the PDF. Please ensure the PDF contains readable text.');
  }
  
  // Parse the extracted text into resume format
  const resumeData = await parseResumeFromText(extractedText);
  
  return resumeData;
}