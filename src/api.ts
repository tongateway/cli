import { loadToken, getApiUrl } from './config.js';

export async function apiCall(path: string, options: RequestInit = {}): Promise<any> {
  const token = loadToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${getApiUrl()}${path}`, {
      ...options,
      headers: {
        ...headers,
        ...(options.headers as Record<string, string> ?? {}),
      },
    });
  } catch {
    throw new Error('Cannot reach api — check your connection.');
  }

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error ?? `API error ${res.status}`);
  }
  return data;
}

export function apiGet(path: string): Promise<any> {
  return apiCall(path);
}

export function apiPost(path: string, body: Record<string, any>): Promise<any> {
  return apiCall(path, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
