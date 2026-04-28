import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';

export function useApi() {
  const { token } = useAuth();

  return {
    get: (path: string) => apiFetch(path, { token }),
    post: (path: string, body: object) => apiFetch(path, { method: 'POST', body, token }),
    put: (path: string, body: object) => apiFetch(path, { method: 'PUT', body, token }),
    del: (path: string) => apiFetch(path, { method: 'DELETE', token }),
  };
}
