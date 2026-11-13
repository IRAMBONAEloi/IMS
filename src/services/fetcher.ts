import api from './api';

export async function fetcher<T>(path: string): Promise<T> {
  const response = await api.get(path);
  return response.data?.data as T;
}
