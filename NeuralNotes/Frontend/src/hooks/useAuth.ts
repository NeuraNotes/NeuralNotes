import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axiosInstance'; // Adjust the path if necessary
import { UserCreate, LoginResponse, UserLogin } from '../types/backend'; // Adjust path

// Hook for user signup
export function useSignup() {
  const queryClient = useQueryClient();
  return useMutation<LoginResponse, Error, UserCreate>({
    mutationFn: async (userData) => {
      const response = await api.post('/auth/signup', userData);
      return response.data;
    },
    onSuccess: () => {
      // Optionally invalidate queries or perform actions on successful signup
      // For example, if a user list exists:
      // queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

// Hook for user login
export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation<LoginResponse, Error, UserLogin>({
    mutationFn: async (credentials) => {
      // Note: Your backend /auth/login uses OAuth2PasswordRequestForm, which expects
      // form-urlencoded data with 'username' and 'password'. Axios can send JSON,
      // and your authenticate_user logic handles 'username' being either email or username.
      // We will send JSON with 'username' and 'password'. If you encounter issues,
      // you might need to send form data instead:
      // const formData = new URLSearchParams();
      // formData.append('username', credentials.username);
      // formData.append('password', credentials.password);
      // const response = await api.post('/auth/login', formData, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });

      const response = await api.post('/auth/login', credentials);
      
      // On successful login, store the token (e.g., in localStorage)
      if (response.data && response.data.access_token) {
          localStorage.setItem('authToken', response.data.access_token);
          // Axios instance interceptor should pick this up for future requests
      }

      return response.data;
    },
    onSuccess: (data) => {
      // Optionally redirect or update UI state after login
      console.log('Login successful', data);
    },
    onError: (error) => {
        console.error('Login failed', error);
        // Handle login failure (e.g., show error message to user)
    }
  });
} 