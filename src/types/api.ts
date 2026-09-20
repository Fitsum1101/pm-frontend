// The Express gateway wraps every response in this envelope.
export interface ApiEnvelope<T = unknown> {
  success: boolean;
  message: string;
  status?: number;
  data: T;
}

// Paginated list envelope (data.data holds the rows).
export interface PaginatedData<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}
