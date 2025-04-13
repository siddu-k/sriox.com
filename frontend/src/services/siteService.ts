import apiService from './apiService';
import { Site, CreateSiteDTO, UpdateSiteDTO, PaginationParams, PaginatedResponse } from '../types';

const SITES_ENDPOINT = '/sites';

const siteService = {
  /**
   * Get all sites for the current user
   */
  getAllSites: async (params?: PaginationParams): Promise<PaginatedResponse<Site>> => {
    return apiService.get<PaginatedResponse<Site>>(SITES_ENDPOINT, params);
  },

  /**
   * Get site by ID
   */
  getSiteById: async (id: string): Promise<Site> => {
    return apiService.get<Site>(`${SITES_ENDPOINT}/${id}`);
  },

  /**
   * Create a new site
   */
  createSite: async (siteData: CreateSiteDTO): Promise<Site> => {
    return apiService.post<Site>(SITES_ENDPOINT, siteData);
  },

  /**
   * Update an existing site
   */
  updateSite: async (id: string, siteData: UpdateSiteDTO): Promise<Site> => {
    return apiService.patch<Site>(`${SITES_ENDPOINT}/${id}`, siteData);
  },

  /**
   * Delete a site
   */
  deleteSite: async (id: string): Promise<void> => {
    return apiService.delete<void>(`${SITES_ENDPOINT}/${id}`);
  },

  /**
   * Upload site files
   * @param id Site ID
   * @param files FormData with files
   */
  uploadFiles: async (id: string, files: FormData): Promise<Site> => {
    return apiService.post<Site>(`${SITES_ENDPOINT}/${id}/upload`, files, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  /**
   * List site files
   */
  listFiles: async (id: string, directory: string = '/'): Promise<Array<{ name: string; path: string; size: number; type: 'file' | 'directory'; lastModified: Date }>> => {
    return apiService.get<Array<{ name: string; path: string; size: number; type: 'file' | 'directory'; lastModified: Date }>>(
      `${SITES_ENDPOINT}/${id}/files`,
      { directory }
    );
  },

  /**
   * Delete site file
   */
  deleteFile: async (id: string, filePath: string): Promise<void> => {
    return apiService.delete<void>(`${SITES_ENDPOINT}/${id}/files`, { data: { filePath } });
  },

  /**
   * Create directory in site
   */
  createDirectory: async (id: string, dirPath: string): Promise<void> => {
    return apiService.post<void>(`${SITES_ENDPOINT}/${id}/directories`, { dirPath });
  },

  /**
   * Check if a subdomain is available
   */
  checkSubdomainAvailability: async (subdomain: string): Promise<{ available: boolean }> => {
    return apiService.get<{ available: boolean }>(`${SITES_ENDPOINT}/check-subdomain/${subdomain}`);
  },

  /**
   * Enable a site
   */
  enableSite: async (id: string): Promise<Site> => {
    return apiService.post<Site>(`${SITES_ENDPOINT}/${id}/enable`);
  },

  /**
   * Disable a site
   */
  disableSite: async (id: string): Promise<Site> => {
    return apiService.post<Site>(`${SITES_ENDPOINT}/${id}/disable`);
  },

  /**
   * Get site analytics
   */
  getSiteAnalytics: async (id: string, period: 'day' | 'week' | 'month' | 'year'): Promise<any> => {
    return apiService.get<any>(`${SITES_ENDPOINT}/${id}/analytics`, { period });
  },

  /**
   * Add custom domain to site
   */
  addCustomDomain: async (id: string, domain: string): Promise<Site> => {
    return apiService.post<Site>(`${SITES_ENDPOINT}/${id}/domains`, { domain });
  },

  /**
   * Remove custom domain from site
   */
  removeCustomDomain: async (id: string, domain: string): Promise<Site> => {
    return apiService.delete<Site>(`${SITES_ENDPOINT}/${id}/domains/${domain}`);
  },

  /**
   * Verify custom domain DNS setup
   */
  verifyDomain: async (id: string, domain: string): Promise<{ verified: boolean; message: string }> => {
    return apiService.post<{ verified: boolean; message: string }>(
      `${SITES_ENDPOINT}/${id}/domains/${domain}/verify`
    );
  }
};

export default siteService;