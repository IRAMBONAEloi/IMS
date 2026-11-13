import { useEffect, type ReactNode } from 'react';
import useSWR from 'swr';
import api from './api';
import { authService, type AuthUser } from './auth.service';
import { AuthContext } from './auth-context-value';

async function loadSession(path: string): Promise<AuthUser> {
  const response = await api.get(path);
  return response.data.user as AuthUser;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const cachedUser = authService.getUser();
  const { data, error, isLoading, mutate } = useSWR<AuthUser>('/auth/me', loadSession, {
    fallbackData: cachedUser ?? undefined,
    revalidateOnMount: !cachedUser,
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  useEffect(() => {
    if (data) authService.setUser(data);
    else if (error) authService.setUser(null);
  }, [data, error]);

  const setUser = (user: AuthUser | null) => {
    authService.setUser(user);
    void mutate(user ?? undefined, { revalidate: false });
  };

  return (
    <AuthContext.Provider value={{ user: data ?? null, loading: !data && isLoading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

