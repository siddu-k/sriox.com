// User related types
export interface User {
  id: string;
  username: string;
  email: string;
  planId: string;
  createdAt: string;
  updatedAt: string;
}

// Site related types
export interface Site {
  id: string;
  userId: string;
  subdomain: string;
  displayName: string;
  status: 'active' | 'pending' | 'disabled';
  sizeBytes: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSiteDTO {
  subdomain: string;
  displayName: string;
}

export interface UpdateSiteDTO {
  displayName?: string;
  status?: 'active' | 'pending' | 'disabled';
}

// Redirect related types
export interface Redirect {
  id: string;
  userId: string;
  subdomain: string;
  target: string;
  status: 'active' | 'disabled';
  createdAt: string;
  updatedAt: string;
}

export interface CreateRedirectDTO {
  subdomain: string;
  target: string;
}

export interface UpdateRedirectDTO {
  target?: string;
  status?: 'active' | 'disabled';
}

// GitHub Pages related types
export interface GithubPage {
  id: string;
  userId: string;
  subdomain: string;
  repository: string;
  username: string;
  status: 'active' | 'disabled';
  createdAt: string;
  updatedAt: string;
}

export interface CreateGithubPageDTO {
  subdomain: string;
  repository: string;
  username: string;
}

export interface UpdateGithubPageDTO {
  repository?: string;
  username?: string;
  status?: 'active' | 'disabled';
}

// Plan related types
export interface Plan {
  id: string;
  name: string;
  isPro: boolean;
  sitesLimit: number;
  redirectsLimit: number;
  githubPagesLimit: number;
  maxFileSizeBytes: number;
  price: number;
}

// Subscription related types
export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'canceled' | 'expired';
  startDate: string;
  endDate: string | null;
  plan: Plan;
}

// Dashboard statistics types
export interface ResourceStats {
  used: number;
  limit: number;
  percentage: number;
}

export interface UserStats {
  sites: ResourceStats;
  redirects: ResourceStats;
  githubPages: ResourceStats;
  plan: {
    name: string;
    isPro: boolean;
  };
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any;
}

// Pagination types
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

// File Upload Types
export interface FileUploadResponse {
  success: boolean;
  filename: string;
  path: string;
  size: number;
}

// Error types
export interface ApiError {
  message: string;
  code?: string;
  field?: string;
}