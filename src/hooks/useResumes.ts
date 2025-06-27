import { useState, useEffect } from 'react';
import { Resume } from '../types/resume';
import { db } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface DatabaseResume {
  id: string;
  name: string | null;
  data: Resume;
  created_at: string;
  updated_at: string;
}

export function useResumes() {
  const [resumes, setResumes] = useState<DatabaseResume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const loadResumes = async () => {
    if (!user) {
      console.log('No user found, skipping resume load');
      setResumes([]);
      setLoading(false);
      return;
    }

    try {
      console.log('Loading resumes for user:', user.id);
      setLoading(true);
      setError(null);
      
      // Check if environment variables are set
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase environment variables are not configured. Please check your .env file.');
      }
      
      console.log('Supabase URL configured:', !!supabaseUrl);
      console.log('Supabase Key configured:', !!supabaseKey);
      
      const { data, error } = await db.resumes.list(user.id);
      
      if (error) {
        console.error('Database error:', error);
        setError(`Database error: ${error.message}`);
        setResumes([]);
      } else {
        console.log('Resumes loaded successfully:', data?.length || 0);
        setResumes(data || []);
      }
    } catch (err) {
      console.error('Unexpected error loading resumes:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unable to connect to database';
      setError(errorMessage);
      setResumes([]);
    } finally {
      setLoading(false);
    }
  };

  const saveResume = async (resume: Resume, name?: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      console.log('Saving resume for user:', user.id);
      
      const resumeData = {
        user_id: user.id,
        name: name || `Resume ${new Date().toLocaleDateString()}`,
        data: resume,
      };

      const { data, error } = await db.resumes.create(resumeData);
      
      if (error) {
        console.error('Save error:', error);
        throw new Error(`Failed to save resume: ${error.message}`);
      }
      
      console.log('Resume saved successfully:', data.id);
      await loadResumes(); // Refresh the list
      
      // Track analytics (non-blocking)
      try {
        await db.analytics.track('resume_created', { resume_id: data.id });
      } catch (analyticsError) {
        console.warn('Analytics tracking failed:', analyticsError);
      }
      
      return data;
    } catch (err) {
      console.error('Save resume error:', err);
      throw err;
    }
  };

  const updateResume = async (id: string, resume: Resume, name?: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      console.log('Updating resume:', id);
      
      const updates: any = { data: resume };
      if (name !== undefined) {
        updates.name = name;
      }

      const { data, error } = await db.resumes.update(id, updates);
      
      if (error) {
        console.error('Update error:', error);
        throw new Error(`Failed to update resume: ${error.message}`);
      }
      
      console.log('Resume updated successfully');
      await loadResumes(); // Refresh the list
      
      // Track analytics (non-blocking)
      try {
        await db.analytics.track('resume_updated', { resume_id: id });
      } catch (analyticsError) {
        console.warn('Analytics tracking failed:', analyticsError);
      }
      
      return data;
    } catch (err) {
      console.error('Update resume error:', err);
      throw err;
    }
  };

  const deleteResume = async (id: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      console.log('Deleting resume:', id);
      
      const { error } = await db.resumes.delete(id);
      
      if (error) {
        console.error('Delete error:', error);
        throw new Error(`Failed to delete resume: ${error.message}`);
      }
      
      console.log('Resume deleted successfully');
      await loadResumes(); // Refresh the list
      
      // Track analytics (non-blocking)
      try {
        await db.analytics.track('resume_deleted', { resume_id: id });
      } catch (analyticsError) {
        console.warn('Analytics tracking failed:', analyticsError);
      }
    } catch (err) {
      console.error('Delete resume error:', err);
      throw err;
    }
  };

  const getResume = async (id: string) => {
    try {
      console.log('Getting resume:', id);
      
      const { data, error } = await db.resumes.get(id);
      
      if (error) {
        console.error('Get resume error:', error);
        throw new Error(`Failed to load resume: ${error.message}`);
      }
      
      console.log('Resume retrieved successfully');
      return data;
    } catch (err) {
      console.error('Get resume error:', err);
      throw err;
    }
  };

  useEffect(() => {
    console.log('useResumes effect triggered, user:', user?.id);
    loadResumes();
  }, [user]);

  return {
    resumes,
    loading,
    error,
    saveResume,
    updateResume,
    deleteResume,
    getResume,
    refreshResumes: loadResumes,
  };
}