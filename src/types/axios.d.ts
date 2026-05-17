import 'axios';

declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    /** Tracks whether this request incremented the global API loader counter. */
    _loadingTracked?: boolean;
    /** When true, the global loader is not shown for this request. */
    skipGlobalLoader?: boolean;
    /** Set by auth interceptor on token refresh retry. */
    _retry?: boolean;
  }
}
