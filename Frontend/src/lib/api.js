const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function getAccessToken() {
  return localStorage.getItem('accessToken');
}

export function authorizedFetch(path, options = {}) {
  const token = getAccessToken();
  const headers = { ...(options.headers || {}) };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const hasBody =
    typeof options.body === 'string' ||
    (!(options.body == null || options.body === '') && !isFormData);

  if (hasBody && !headers['Content-Type'] && !isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  return fetch(`${API_BASE_URL}${path}`, {
    credentials: options.credentials ?? 'include',
    ...options,
    headers,
  });
}
