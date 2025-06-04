import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axiosInstance';
import { FolderOut, FolderCreate } from '../types/backend';

const folderKeys = {
  all: ['folders'] as const,
  lists: () => [...folderKeys.all, 'list'] as const,
  folder: (folderId: number) => [...folderKeys.all, folderId] as const,
};

// Hook to fetch all folders
export function useFolders() {
  return useQuery<FolderOut[]>({
    queryKey: folderKeys.lists(),
    queryFn: async () => {
      const response = await api.get('/folders/');
      return response.data;
    },
  });
}

// Hook to create a new folder
export function useCreateFolder() {
  const queryClient = useQueryClient();
  return useMutation<FolderOut, Error, FolderCreate>({
    mutationFn: async (newFolderData) => {
      const response = await api.post('/folders/', newFolderData);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate the folders list cache to refetch folders after creation
      queryClient.invalidateQueries({ queryKey: folderKeys.lists() });
    },
  });
}

// Note: There is no delete or update endpoint for folders in the backend yet.
// If you add them, you would create similar mutations here. 