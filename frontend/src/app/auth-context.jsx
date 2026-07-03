import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api, { clearSession, setAccessToken } from './api';
import { connectSocket, disconnectSocket } from './socket';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      try {
        const response = await api.get('/auth/me');
        if (isMounted) {
          setUser(response.data?.data?.user || null);
        }
      } catch (_error) {
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    function handleSessionExpiry() {
      clearSession();
      setUser(null);
    }

    loadSession();
    window.addEventListener('auth:session-expired', handleSessionExpiry);

    return () => {
      isMounted = false;
      window.removeEventListener('auth:session-expired', handleSessionExpiry);
    };
  }, []);

  async function login(credentials) {
    const response = await api.post('/auth/login', credentials);
    const payload = response.data?.data || {};

    if (payload.accessToken) {
      setAccessToken(payload.accessToken);
    }

    setUser(payload.user || null);
    return payload;
  }

  async function register(details) {
    const response = await api.post('/auth/register', details);
    return response.data?.data || {};
  }

  function logout() {
    clearSession();
    setUser(null);
  }

  useEffect(() => {
    if (user) {
      connectSocket(user);
    } else {
      disconnectSocket();
    }
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      setUser,
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }

  return context;
}