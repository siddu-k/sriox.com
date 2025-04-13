import apiService from './apiService';
import { Redirect, CreateRedirectDTO, UpdateRedirectDTO, PaginationParams, PaginatedResponse } from '../types';

const REDIRECTS_ENDPOINT = '/redirects';

const redirectService = {
  /**
   * Get all redirects for the current user
   */
  getAllRedirects: async (params?: PaginationParams): Promise<PaginatedResponse<Redirect>> => {
    return apiService.get<PaginatedResponse<Redirect>>(REDIRECTS_ENDPOINT, params);
  },

  /**
   * Get redirect by ID
   */
  getRedirectById: async (id: string): Promise<Redirect> => {
    return apiService.get<Redirect>(`${REDIRECTS_ENDPOINT}/${id}`);
  },

  /**
   * Create a new redirect
   */
  createRedirect: async (redirectData: CreateRedirectDTO): Promise<Redirect> => {
    return apiService.post<Redirect>(REDIRECTS_ENDPOINT, redirectData);
  },

  /**
   * Update an existing redirect
   */
  updateRedirect: async (id: string, redirectData: UpdateRedirectDTO): Promise<Redirect> => {
    return apiService.patch<Redirect>(`${REDIRECTS_ENDPOINT}/${id}`, redirectData);
  },

  /**
   * Delete a redirect
   */
  deleteRedirect: async (id: string): Promise<void> => {
    return apiService.delete<void>(`${REDIRECTS_ENDPOINT}/${id}`);
  },

  /**
   * Enable a redirect
   */
  enableRedirect: async (id: string): Promise<Redirect> => {
    return apiService.post<Redirect>(`${REDIRECTS_ENDPOINT}/${id}/enable`);
  },

  /**
   * Disable a redirect
   */
  disableRedirect: async (id: string): Promise<Redirect> => {
    return apiService.post<Redirect>(`${REDIRECTS_ENDPOINT}/${id}/disable`);
  },

  /**
   * Check if a subdomain is available for redirect
   */
  checkSubdomainAvailability: async (subdomain: string): Promise<{ available: boolean }> => {
    return apiService.get<{ available: boolean }>(`${REDIRECTS_ENDPOINT}/check-subdomain/${subdomain}`);
  },

  /**
   * Get redirect analytics
   */
  getRedirectAnalytics: async (id: string, period: 'day' | 'week' | 'month' | 'year'): Promise<any> => {
    return apiService.get<any>(`${REDIRECTS_ENDPOINT}/${id}/analytics`, { period });
  },
};

export default redirectService;