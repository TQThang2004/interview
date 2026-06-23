import { API_BASE_URL } from '../constants/api';

export const API_BASE = API_BASE_URL;

export function buildQueryUrl(path, params = {}) {
  const url = new URL(`${API_BASE}${path}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.append(key, value);
    }
  });
  return url;
}

export async function parseJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export async function jsonOrThrow(res, fallback = null) {
  const data = await parseJson(res);
  if (!res.ok) {
    throw new Error(data?.detail || fallback || `Lỗi máy chủ (${res.status})`);
  }
  return data;
}

export async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(options.headers || {}),
    },
  });
  return res;
}
