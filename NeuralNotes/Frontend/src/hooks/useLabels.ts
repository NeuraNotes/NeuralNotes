import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axiosInstance';
import { LabelOut, LabelBase } from '../types/backend';

const labelKeys = {
  all: ['labels'] as const,
  lists: () => [...labelKeys.all, 'list'] as const,
  label: (labelId: number) => [...labelKeys.all, labelId] as const,
};

// Hook to fetch all labels
export function useLabels() {
  return useQuery<LabelOut[]>({
    queryKey: labelKeys.lists(),
    queryFn: async () => {
      const response = await api.get('/labels/');
      return response.data;
    },
  });
}

// Hook to create a new label
export function useCreateLabel() {
  const queryClient = useQueryClient();
  return useMutation<LabelOut, Error, LabelBase>({
    mutationFn: async (newLabelData) => {
      const response = await api.post('/labels/', newLabelData);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate the labels list cache to refetch labels after creation
      queryClient.invalidateQueries({ queryKey: labelKeys.lists() });
    },
  });
}

// Hook to delete a label
export function useDeleteLabel() {
  const queryClient = useQueryClient();
  return useMutation<LabelOut, Error, number>({
    mutationFn: async (labelId) => {
      const response = await api.delete(`/labels/${labelId}`);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate the labels list cache to refetch labels after deletion
      queryClient.invalidateQueries({ queryKey: labelKeys.lists() });
    },
  });
} 