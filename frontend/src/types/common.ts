// Common union types used across entities

export type EntityStatus = 
  | 'active'
  | 'inactive'
  | 'draft'
  | 'archived'
  | 'deleted';

export type VerificationStatus = 
  | 'unverified'
  | 'pending'
  | 'verified'
  | 'rejected';

export type PaymentStatus = 
  | 'free'
  | 'pending'
  | 'paid'
  | 'refunded'
  | 'failed'
  | 'cancelled';

export type NotificationType = 
  | 'tournament_invitation'
  | 'match_reminder'
  | 'match_result'
  | 'tournament_update'
  | 'community_invite'
  | 'friend_request'
  | 'system'
  | 'achievement'
  | 'payment';

export type NotificationPriority = 
  | 'low'
  | 'normal'
  | 'high'
  | 'urgent';

export type Region = 
  | 'global'
  | 'na' // North America
  | 'eu' // Europe
  | 'asia'
  | 'sa' // South America
  | 'oce' // Oceania
  | 'africa'
  | 'mena' // Middle East & North Africa
  | 'cis'; // Commonwealth of Independent States

export type Language = 
  | 'en'
  | 'ru'
  | 'es'
  | 'fr'
  | 'de'
  | 'it'
  | 'pt'
  | 'zh'
  | 'ja'
  | 'ko';

export type Currency = 
  | 'USD'
  | 'EUR'
  | 'RUB'
  | 'GBP'
  | 'CNY'
  | 'JPY'
  | 'KRW'
  | 'BRL';

export type Platform = 
  | 'pc'
  | 'playstation'
  | 'xbox'
  | 'nintendo'
  | 'mobile'
  | 'web';

export type SortOrder = 'asc' | 'desc';

export type SortField = 
  | 'name'
  | 'createdAt'
  | 'updatedAt'
  | 'rating'
  | 'popularity'
  | 'startDate'
  | 'prizePool';

export type PaginationParams = {
  page: number;
  limit: number;
  offset?: number;
};

export type SortParams = {
  sortBy: SortField;
  sortOrder: SortOrder;
};

export type FilterParams = {
  search?: string;
  status?: string[];
  game?: string;
  region?: Region;
  dateFrom?: string;
  dateTo?: string;
  minPrize?: number;
  maxPrize?: number;
};

export type ApiParams = PaginationParams & SortParams & FilterParams;

export type ApiResponse<T> = {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
};

export type PaginatedResponse<T> = ApiResponse<{
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}>;

export type ApiError = {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
};

export type FileUpload = {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: string;
};

export type TimeSlot = {
  start: string;
  end: string;
  available: boolean;
};

export type ColorScheme = 
  | 'light'
  | 'dark'
  | 'system';

export type Theme = 
  | 'default'
  | 'blue'
  | 'green'
  | 'purple'
  | 'orange'
  | 'red';
