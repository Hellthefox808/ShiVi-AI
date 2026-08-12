export interface ApiConfig { baseUrl: string; apiKey?: string; timeout: number; retries: number; }
export interface ApiResponse<T> { data: T; status: number; headers: Record<string, string>; }
export interface PaginatedResponse<T> { items: T[]; total: number; page: number; pageSize: number; hasMore: boolean; }
export interface ApiError { code: string; message: string; details?: unknown; }
export class ShiViApiClient { constructor(private config: ApiConfig) {}
  async get<T>(path: string): Promise<ApiResponse<T>> { return { data: {} as T, status: 200, headers: {} }; }
  async post<T>(path: string, body: unknown): Promise<ApiResponse<T>> { return { data: {} as T, status: 201, headers: {} }; }
}
