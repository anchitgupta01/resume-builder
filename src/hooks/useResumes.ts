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
      const { data, error } = await db.resumes.list(user.id);
      
      if (error) {
        setError(error.message);
      } else {
        setResumes(data || []);
      }
    } catch (err) {
      setError('Failed to load resumes');
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
      
      if (error) throw error;
      
      await loadResumes(); // Refresh the list
      await db.analytics.track('resume_created', { resume_id: data.id });
      
      return data;
    } catch (err) {
      throw new Error('Failed to save resume');
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
      
      if (error) throw error;
      
      await loadResumes(); // Refresh the list
      await db.analytics.track('resume_updated', { resume_id: id });
      
      return data;
    } catch (err) {
      throw new Error('Failed to update resume');
    }
  };

  const deleteResume = async (id: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error } = await db.resumes.delete(id);
      
      if (error) throw error;
      
      await loadResumes(); // Refresh the list
      await db.analytics.track('resume_deleted', { resume_id: id });
    } catch (err) {
      throw new Error('Failed to delete resume');
    }
  };

  const getResume = async (id: string) => {
    try {
      const { data, error } = await db.resumes.get(id);
      
      if (error) throw error;
      
      return data;
    } catch (err) {
      throw new Error('Failed to load resume');
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