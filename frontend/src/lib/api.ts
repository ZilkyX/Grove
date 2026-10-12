import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

export interface ApiErrorResponse {
  message: string;
}

let refreshPromise: Promise<unknown> | null = null;

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retried?: boolean;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetriableConfig | undefined;
    const isAuthEndpoint = config?.url?.includes("/auth/");

    if (error.response?.status !== 401 || !config || config._retried || isAuthEndpoint) {
      throw error;
    }

    config._retried = true;

    refreshPromise ??= api
      .post("/auth/refresh-token")
      .finally(() => {
        refreshPromise = null;
      });

    try {
      await refreshPromise;
    } catch {
      throw error;
    }

    return api(config);
  },
);
