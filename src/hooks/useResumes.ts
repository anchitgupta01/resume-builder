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
      setResumes([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await db.resumes.list(user.id);
      
      if (error) {
        console.error('Database error:', error);
        setError('Failed to load resumes from database');
        setResumes([]);
      } else {
        setResumes(data || []);
      }
    } catch (err) {
      console.error('Unexpected error loading resumes:', err);
      setError('Unable to connect to database');
      setResumes([]);
    } finally {
      setLoading(false);
    }
  };

  const saveResume = async (resume: Resume, name?: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const resumeData = {
        user_id: user.id,
        name: name || `Resume ${new Date().toLocaleDateString()}`,
        data: resume,
      };

      const { data, error } = await db.resumes.create(resumeData);
      
      if (error) {
        throw new Error(`Failed to save resume: ${error.message}`);
      }
      
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
      const updates: any = { data: resume };
      if (name !== undefined) {
        updates.name = name;
      }

      const { data, error } = await db.resumes.update(id, updates);
      
      if (error) {
        throw new Error(`Failed to update resume: ${error.message}`);
      }
      
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
      const { error } = await db.resumes.delete(id);
      
      if (error) {
        throw new Error(`Failed to delete resume: ${error.message}`);
      }
      
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
      const { data, error } = await db.resumes.get(id);
      
      if (error) {
        throw new Error(`Failed to load resume: ${error.message}`);
      }
      
      return data;
    } catch (err) {
      console.error('Get resume error:', err);
      throw err;
    }
  };

  useEffect(() => {
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