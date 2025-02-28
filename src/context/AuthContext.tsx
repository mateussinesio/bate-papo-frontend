import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../api";

interface AuthContextType {
  user: string | null;
  setUser: (user: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const validateResponse = await api.get('/auth/validate', { withCredentials: true });

        if (!validateResponse.data) {
          throw new Error('Invalid token.');
        }

        const userInfoResponse = await api.get('/auth/userinfo', { withCredentials: true });
        setUser(userInfoResponse.data);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};