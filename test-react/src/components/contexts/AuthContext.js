// src/components/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const API_URL = 'http://localhost:5000/api';
const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Vérifier si l'utilisateur est connecté au chargement
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Fonction de connexion
  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        let errorMessage = 'Erreur de connexion';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          if (response.status === 401) {
            errorMessage = 'Email ou mot de passe incorrect';
          } else if (response.status === 404) {
            errorMessage = 'Utilisateur non trouvé';
          } else {
            errorMessage = `Erreur ${response.status}: ${response.statusText}`;
          }
        }
        return { success: false, message: errorMessage };
      }

      const data = await response.json();
      
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('userId', data.user.id);
      localStorage.setItem('userRole', data.user.role);
      localStorage.setItem('userName', `${data.user.prenom} ${data.user.nom}`);
      
      return { success: true, data };
    } catch (error) {
      console.error('Erreur de connexion:', error);
      return { success: false, message: 'Erreur de connexion' };
    }
  };

  // Fonction de déconnexion
  const logout = async () => {
    try {
      // Appel optionnel à l'API
      if (token) {
        await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      // Nettoyer l'état local
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userId');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userName');
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};