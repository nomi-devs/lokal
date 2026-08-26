import axios from "axios";

// apiClient must not import "@/store" or "@/store/slices/authSlice" at module
// scope — store/index.ts imports authSlice.ts which imports this file, so an
// eager import back into the store here creates a circular ESM init cycle
// (crashes with "Cannot access 'authReducer' before initialization"). Instead
// the store wires itself in via configureApiClientAuth() once it exists.
let getAccessToken: () => string | null = () => null;
let getRefreshToken: () => string | null = () => null;
let onTokenRefreshed: (tokens: { accessToken: string; expiresIn: number }) => void = () => {};
let onRefreshFailed: () => void = () => {};

export function configureApiClientAuth(hooks: {
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  onTokenRefreshed: (tokens: { accessToken: string; expiresIn: number }) => void;
  onRefreshFailed: () => void;
}) {
  getAccessToken = hooks.getAccessToken;
  getRefreshToken = hooks.getRefreshToken;
  onTokenRefreshed = hooks.onTokenRefreshed;
  onRefreshFailed = hooks.onRefreshFailed;
}

// Every response from local-be is wrapped as { success, ...payload } or
// { success: false, error: { code, message, details } } — see
// local-be/src/common/filters/app-exception.filter.ts.
export interface ApiErrorBody {
  success: false;
  error: { code: string; message: string; details?: { field: string; message: string }[] };
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3001",
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// One shared in-flight refresh promise so concurrent 401s don't each fire
// their own /dashboard/auth/refresh-token call.
let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  const response = await axios.post<{ accessToken: string; expiresIn: number }>(
    `${apiClient.defaults.baseURL}/dashboard/auth/refresh-token`,
    { refreshToken }
  );

  onTokenRefreshed(response.data);

  return response.data.accessToken;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== "/dashboard/auth/refresh-token" &&
      originalRequest.url !== "/dashboard/auth/logout"
    ) {
      originalRequest._retry = true;
      try {
        refreshPromise ??= refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
        const accessToken = await refreshPromise;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        return apiClient(originalRequest);
      } catch {
        onRefreshFailed();
      }
    }

    return Promise.reject(error);
  }
);

// Pulls the { code, message } out of our backend's error envelope, falling
// back to a generic message for network errors / anything unexpected.
export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again."
): string {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    return error.response?.data?.error?.message ?? fallback;
  }

  return fallback;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
}

// Every list endpoint in local-be responds { success, data: T[], pagination }
// and every lib/*Api.ts list function was hand-rolling the same
// apiClient.get<{...}>(url, { params: { page: 1, limit: 100, ...params } })
// wrapper — this is the one place that shape lives now.
export async function listPaginated<T>(
  url: string,
  params: object = {}
): Promise<{ data: T[]; pagination: Pagination }> {
  const { data } = await apiClient.get<{ success: true; data: T[]; pagination: Pagination }>(url, {
    params: { page: 1, limit: 100, ...params },
  });

  return { data: data.data, pagination: data.pagination };
}

// Same idea for the equally-repeated single-resource delete call.
export async function del(url: string): Promise<{ success: true; message: string }> {
  const { data } = await apiClient.delete<{ success: true; message: string }>(url);

  return data;
}
