import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axiosInstance';
import { NoteOut, NoteCreate, NoteUpdate } from '../types/backend';

const noteKeys = {
  all: ['notes'] as const,
  lists: () => [...noteKeys.all, 'list'] as const,
  note: (noteId: number) => [...noteKeys.all, noteId] as const,
};

// Not tipi tanımlaması
export interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
  tags: string[];
}

// Sıralama seçenekleri
export type SortOption = 'newest' | 'oldest' | 'alphabetical' | 'lastUpdated';

/**
 * Notları yönetmek için hook
 * Şimdilik mock veri kullanıyor, ileride API'ye bağlanacak
 */
export function useNotes() {
  return useQuery<NoteOut[]>({
    queryKey: noteKeys.lists(),
    queryFn: async () => {
      const response = await api.get('/notes/');
      return response.data;
    },
  });
}

// Hook to fetch a single note by ID
export function useNote(noteId: number) {
    return useQuery<NoteOut>({
        queryKey: noteKeys.note(noteId),
        queryFn: async () => {
          const response = await api.get(`/notes/${noteId}`);
          return response.data;
        },
        enabled: !!noteId, // Only run the query if noteId is truthy
    });
}

// Hook to create a new note
export function useCreateNote() {
  const queryClient = useQueryClient();
  return useMutation<NoteOut, Error, NoteCreate>({
    mutationFn: async (newNoteData) => {
      const response = await api.post('/notes/', newNoteData);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate the notes list cache to refetch notes after creation
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
    },
  });
}

// Hook to update an existing note
export function useUpdateNote() {
  const queryClient = useQueryClient();
  return useMutation<NoteOut, Error, { noteId: number; data: NoteUpdate }>({
    mutationFn: async ({ noteId, data }) => {
      const response = await api.put(`/notes/${noteId}`, data);
      return response.data;
    },
    onSuccess: (updatedNote) => {
      // Invalidate the specific note cache and the notes list cache
      queryClient.invalidateQueries({ queryKey: noteKeys.note(updatedNote.id) });
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
    },
  });
}

// Hook to delete a note
export function useDeleteNote() {
  const queryClient = useQueryClient();
  return useMutation<NoteOut, Error, number>({
    mutationFn: async (noteId) => {
      const response = await api.delete(`/notes/${noteId}`);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate the notes list cache to refetch notes after deletion
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
    },
  });
}

export default useNotes;
