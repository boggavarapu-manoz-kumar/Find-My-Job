import axios, { AxiosError } from 'axios';
import apiClient from './client';
import type { ApiResponse } from '../types/job.types';
import type { LoginRequest, AuthResponse, User } from '../types/auth.types';

export const authService = {
  /**
   * Authenticate administrator against Spring Boot backend.
   * Endpoint: POST /api/v1/auth/login
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data?.message || 'Authentication failed');
    } catch (error) {
      const axiosErr = error as AxiosError<ApiResponse<unknown>>;
      const message =
        axiosErr.response?.data?.message ||
        axiosErr.message ||
        'Unable to connect to the authentication service.';
      throw new Error(message);
    }
  },

  /**
   * Fetch current authenticated user profile using active JWT Bearer token.
   * Endpoint: GET /api/v1/auth/me
   */
  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiClient.get<ApiResponse<User>>('/auth/me');
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data?.message || 'Failed to fetch user profile');
    } catch (error) {
      if (axios.isCancel(error)) {
        throw error;
      }
      const axiosErr = error as AxiosError<ApiResponse<unknown>>;
      const message =
        axiosErr.response?.data?.message ||
        axiosErr.message ||
        'Failed to authenticate session.';
      throw new Error(message);
    }
  },

  /**
   * Optional server logout handshake.
   * Endpoint: POST /api/v1/auth/logout
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Non-blocking, token will still be cleared client-side
    }
  },
};

export default authService;
