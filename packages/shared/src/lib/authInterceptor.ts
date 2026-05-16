import { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let isRefreshing = false;
let queue: Array<{ resolve: () => void; reject: (e: unknown) => void }> = [];

function flushQueue(error: unknown) {
  queue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve()));
  queue = [];
}

function redirectToLogin() {
  try {
    sessionStorage.removeItem('auth-storage');
    localStorage.removeItem('auth-storage');
  } catch { /* ignore */ }

  // Guard: don't redirect if already on login — prevents reload loops
  if (!window.location.pathname.startsWith('/login')) {
    window.location.href = '/login';
  }
}

/**
 * Attaches a 401 → refresh → retry interceptor to any axios instance.
 *
 * Uses the same instance for the refresh call (correct baseURL guaranteed),
 * with _retry:true pre-set so a failing refresh cannot re-enter this interceptor.
 *
 * Concurrent 401s are queued — only one refresh attempt is made.
 */
export function attachAuthInterceptor(instance: AxiosInstance): void {
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const config = error.config as RetryConfig | undefined;

      // Pass through: not a 401, no config, or already retried
      if (error.response?.status !== 401 || !config || config._retry) {
        return Promise.reject(error);
      }

      // Another refresh is already in flight — queue and wait
      if (isRefreshing) {
        return new Promise<void>((resolve, reject) => {
          queue.push({ resolve, reject });
        })
          .then(() => instance(config))
          .catch((e) => Promise.reject(e));
      }

      config._retry = true;
      isRefreshing = true;

      try {
        // _retry:true prevents this call from re-entering the interceptor
        // if the refresh itself returns 401 (avoids infinite loop)
        await instance.post('/auth/refresh', {}, { _retry: true } as RetryConfig);
        flushQueue(null);
        return instance(config);
      } catch (refreshError) {
        flushQueue(refreshError);
        redirectToLogin();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    },
  );
}
