import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  // Restore session from a saved token
  useEffect(() => {
    if (!localStorage.getItem('token')) {
      setReady(true);
      return;
    }
    api('/auth/me')
      .then(setUser)
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setReady(true));
  }, []);

  const saveSession = ({ user, token }) => {
    localStorage.setItem('token', token);
    setUser(user);
  };

  const login = async (email, password) =>
    saveSession(await api('/auth/login', { method: 'POST', body: { email, password } }));

  const register = async (name, email, password) =>
    saveSession(await api('/auth/register', { method: 'POST', body: { name, email, password } }));

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, ready, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
