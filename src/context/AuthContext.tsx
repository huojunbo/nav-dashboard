import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  token: string | null;
  user: any | null;
  login: (token: string, user: any) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  console.log('AuthProvider rendering');
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  // const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('auth_token');
      const storedUser = localStorage.getItem('auth_user');
      
      if (storedToken && storedToken !== 'undefined' && storedToken !== 'null') {
        setToken(storedToken);
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch (e) {
            console.error('Failed to parse user data', e);
          }
        }
      } else {
          // Clean up invalid data
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
      }
    } catch (e) {
      console.error('Auth initialization error:', e);
    } finally {
      // setLoading(false);
    }
  }, []);

  const login = (newToken: string, newUser: any) => {
    localStorage.setItem('auth_token', newToken);
    localStorage.setItem('auth_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setToken(null);
    setUser(null);
  };

  /* if (loading) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading...</div>;
  } */

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
