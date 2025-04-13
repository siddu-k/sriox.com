import apiService from './apiService';
import { GithubPage, CreateGithubPageDTO, UpdateGithubPageDTO, PaginationParams, PaginatedResponse } from '../types';

const GITHUB_PAGES_ENDPOINT = '/github-pages';

const githubPageService = {
  /**
   * Get all GitHub Pages mappings for the current user
   */
  getAllGithubPages: async (params?: PaginationParams): Promise<PaginatedResponse<GithubPage>> => {
    return apiService.get<PaginatedResponse<GithubPage>>(GITHUB_PAGES_ENDPOINT, params);
  },

  /**
   * Get GitHub Page by ID
   */
  getGithubPageById: async (id: string): Promise<GithubPage> => {
    return apiService.get<GithubPage>(`${GITHUB_PAGES_ENDPOINT}/${id}`);
  },

  /**
   * Create a new GitHub Page mapping
   */
  createGithubPage: async (githubPageData: CreateGithubPageDTO): Promise<GithubPage> => {
    return apiService.post<GithubPage>(GITHUB_PAGES_ENDPOINT, githubPageData);
  },

  /**
   * Update an existing GitHub Page mapping
   */
  updateGithubPage: async (id: string, githubPageData: UpdateGithubPageDTO): Promise<GithubPage> => {
    return apiService.patch<GithubPage>(`${GITHUB_PAGES_ENDPOINT}/${id}`, githubPageData);
  },

  /**
   * Delete a GitHub Page mapping
   */
  deleteGithubPage: async (id: string): Promise<void> => {
    return apiService.delete<void>(`${GITHUB_PAGES_ENDPOINT}/${id}`);
  },

  /**
   * Check if a subdomain is available for GitHub Page
   */
  checkSubdomainAvailability: async (subdomain: string): Promise<{ available: boolean }> => {
    return apiService.get<{ available: boolean }>(`${GITHUB_PAGES_ENDPOINT}/check-subdomain/${subdomain}`);
  },

  /**
   * Verify GitHub repository ownership
   */
  verifyRepositoryOwnership: async (
    repositoryUrl: string
  ): Promise<{ verified: boolean; message: string }> => {
    return apiService.post<{ verified: boolean; message: string }>(
      `${GITHUB_PAGES_ENDPOINT}/verify-repository`,
      { repositoryUrl }
    );
  },

  /**
   * Enable a GitHub Page mapping
   */
  enableGithubPage: async (id: string): Promise<GithubPage> => {
    return apiService.post<GithubPage>(`${GITHUB_PAGES_ENDPOINT}/${id}/enable`);
  },

  /**
   * Disable a GitHub Page mapping
   */
  disableGithubPage: async (id: string): Promise<GithubPage> => {
    return apiService.post<GithubPage>(`${GITHUB_PAGES_ENDPOINT}/${id}/disable`);
  },

  /**
   * Sync GitHub Page content (pull latest updates)
   */
  syncGithubPage: async (id: string): Promise<GithubPage> => {
    return apiService.post<GithubPage>(`${GITHUB_PAGES_ENDPOINT}/${id}/sync`);
  },

  /**
   * Get GitHub Page analytics
   */
  getGithubPageAnalytics: async (id: string, period: 'day' | 'week' | 'month' | 'year'): Promise<any> => {
    return apiService.get<any>(`${GITHUB_PAGES_ENDPOINT}/${id}/analytics`, { period });
  },
};

export default githubPageService;