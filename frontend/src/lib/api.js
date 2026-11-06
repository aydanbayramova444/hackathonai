import { useCallback, useEffect, useState } from 'react';

export class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

async function request(method, path, body) {
  const res = await fetch(`/api${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, data?.error || `Request failed (${res.status})`, data?.details);
  return data;
}

// Any mutation broadcasts a change so every mounted useApi() refetches.
const CHANGE_EVENT = 'hireflow:data-changed';
const notifyChange = () => window.dispatchEvent(new Event(CHANGE_EVENT));

const mutate = (method) => async (path, body) => {
  const data = await request(method, path, body);
  notifyChange();
  return data;
};

export const api = {
  get: (path) => request('GET', path),
  post: mutate('POST'),
  patch: mutate('PATCH'),
  delete: mutate('DELETE'),
};

/** Fetch `path` and refetch whenever data changes anywhere in the app. Pass null to skip. */
export function useApi(path) {
  const [state, setState] = useState({ data: null, error: null, loading: Boolean(path) });

  const load = useCallback(async () => {
    if (!path) return;
    try {
      const data = await request('GET', path);
      setState({ data, error: null, loading: false });
    } catch (error) {
      setState((s) => ({ ...s, error, loading: false }));
    }
  }, [path]);

  useEffect(() => {
    setState((s) => ({ ...s, loading: Boolean(path) }));
    load();
    window.addEventListener(CHANGE_EVENT, load);
    return () => window.removeEventListener(CHANGE_EVENT, load);
  }, [load, path]);

  return { ...state, reload: load, setData: (fn) => setState((s) => ({ ...s, data: typeof fn === 'function' ? fn(s.data) : fn })) };
}
