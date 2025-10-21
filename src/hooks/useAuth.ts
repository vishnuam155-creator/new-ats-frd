import { useState, useEffect } from 'react';

interface User {
  username: string;
  plan: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE = 'http://127.0.0.1:8000';

  useEffect(() => {
    // Check for existing auth on mount
    const token = localStorage.getItem('authToken');
    const username = localStorage.getItem('username');
    
    if (token && username) {
      setAuthToken(token);
      // Verify token and get user plan
      verifyToken(token, username);
    } else {
      setIsLoading(false);
    }
  }, []);

  const verifyToken = async (token: string, username: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/get-user-plan/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser({
          username: data.username,
          plan: data.plan
        });
        setAuthToken(token);
      } else {
        // Token is invalid, clear auth
        logout();
      }
    } catch (error) {
      console.error('Auth verification failed:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = (token: string, username: string, plan: string) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('username', username);
    setAuthToken(token);
    setUser({ username, plan });
  };

  const logout = async () => {
    if (authToken) {
      try {
        await fetch(`${API_BASE}/logout/`, {
          method: 'POST',
          headers: {
            'Authorization': `Token ${authToken}`,
          },
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }

    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    setAuthToken(null);
    setUser(null);
  };

  return {
    user,
    authToken,
    isLoading,
    login,
    logout
  };
};