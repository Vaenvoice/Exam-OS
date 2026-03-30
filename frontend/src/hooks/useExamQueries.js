import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

/**
 * Hook to fetch all exams for the current user (role-aware on backend).
 */
export const useExams = () => {
  return useQuery({
    queryKey: ['exams'],
    queryFn: async () => {
      const res = await axios.get('/api/exams');
      return res.data.data;
    },
  });
};

/**
 * Hook to fetch a single exam with its questions.
 */
export const useExam = (examId) => {
  return useQuery({
    queryKey: ['exam', examId],
    queryFn: async () => {
      const res = await axios.get(`/api/exams/${examId}`);
      return res.data.data;
    },
    enabled: !!examId,
  });
};

/**
 * Hook to fetch results (role-aware on backend).
 */
export const useResults = () => {
  return useQuery({
    queryKey: ['results'],
    queryFn: async () => {
      const res = await axios.get('/api/exams/results');
      return res.data.data;
    },
  });
};

/**
 * Hook to fetch dashboard stats.
 */
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const res = await axios.get('/api/exams/dashboard/stats');
      return res.data.data;
    },
  });
};

/**
 * Hook to fetch saved draft for an exam.
 */
export const useExamDraft = (examId) => {
  return useQuery({
    queryKey: ['examDraft', examId],
    queryFn: async () => {
      const res = await axios.get(`/api/exams/${examId}/draft`);
      return res.data.data;
    },
    enabled: !!examId,
    staleTime: 0, // Always fetch fresh draft
  });
};

/**
 * Mutation hook for autosaving exam answers.
 */
export const useAutosave = (examId) => {
  return useMutation({
    mutationFn: async (answers) => {
      const res = await axios.post(`/api/exams/${examId}/autosave`, { answers });
      return res.data;
    },
  });
};

/**
 * Mutation hook for logging proctoring events.
 */
export const useLogProctoring = (examId) => {
  return useMutation({
    mutationFn: async ({ eventType, message }) => {
      const res = await axios.post(`/api/exams/${examId}/proctor-log`, { eventType, message });
      return res.data;
    },
  });
};

/**
 * Mutation hook for submitting an exam.
 */
export const useSubmitExam = (examId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ answers, proctoringData }) => {
      const res = await axios.post(`/api/exams/${examId}/submit`, { answers, proctoringData });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      queryClient.invalidateQueries({ queryKey: ['results'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
  });
};
