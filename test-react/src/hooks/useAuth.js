import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fonction pour vérifier si l'utilisateur est connecté
  const isAuthenticated = useCallback(() => {
    const token = localStorage.getItem('token');
    const result = !!user && !!token;
    console.log('🔐 isAuthenticated check:', { 
      hasUser: !!user, 
      hasToken: !!token,
      tokenLength: token ? token.length : 0,
      result 
    });
    return result;
  }, [user]);

  // Fonction pour récupérer les informations de l'utilisateur actuel
  const getCurrentUser = useCallback(async () => {
    console.log('🚀 === DÉBUT getCurrentUser ===');
    
    try {
      // Vérification explicite du token à chaque appel
      const token = localStorage.getItem('token');
      console.log('🔑 Token check détaillé:', {
        exists: !!token,
        length: token ? token.length : 0,
        preview: token ? token.substring(0, 50) + '...' : 'NULL'
      });
      
      if (!token || token === 'null' || token === 'undefined') {
        console.log('❌ Token invalide ou absent');
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      console.log('📡 Appel API avec token valide...');
      
      const response = await axios.get('http://localhost:5000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      console.log('✅ Réponse API reçue:', {
        status: response.status,
        statusText: response.statusText,
        dataKeys: Object.keys(response.data || {}),
        data: response.data
      });

      if (response.data) {
        // Gestion flexible des formats de réponse
        let userInfo = null;
        
        if (response.data.user) {
          userInfo = response.data.user;
          console.log('📦 Format: response.data.user');
        } else if (response.data.id || response.data._id) {
          userInfo = response.data;
          console.log('📦 Format: response.data direct');
        } else {
          console.error('❌ Format de réponse non reconnu:', response.data);
          throw new Error('Format de réponse invalide');
        }
        
        console.log('👤 UserInfo extraite:', userInfo);
        
        // Validation des champs requis
        const userId = userInfo.id || userInfo._id;
        if (!userId) {
          console.error('❌ Aucun ID utilisateur trouvé:', userInfo);
          throw new Error('ID utilisateur manquant');
        }
        
        const userData = {
          id: userId,
          prenom: userInfo.prenom || userInfo.firstName || 'N/A',
          nom: userInfo.nom || userInfo.lastName || 'N/A',
          email: userInfo.email || 'N/A',
          role: userInfo.role || 'user'
        };
        
        console.log('✅ Données utilisateur formatées:', userData);
        
        setUser(userData);
        const adminStatus = userData.role === 'admin';
        setIsAdmin(adminStatus);
        
        console.log('🎯 État final appliqué:', { 
          user: userData, 
          isAdmin: adminStatus 
        });
        
      } else {
        console.error('❌ Réponse vide du serveur');
        throw new Error('Réponse vide');
      }
      
    } catch (error) {
      console.error('💥 ERREUR dans getCurrentUser:', error);
      
      if (error.response) {
        console.error('📄 Détails erreur HTTP:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          url: error.config?.url
        });
        
        // Gestion des erreurs d'authentification
        if (error.response.status === 401) {
          console.log('🔑 Token expiré ou invalide - suppression');
          localStorage.removeItem('token');
        }
      } else if (error.request) {
        console.error('🌐 Erreur réseau - serveur inaccessible');
        console.error('Vérifiez que le serveur backend fonctionne sur http://localhost:5000');
      } else {
        console.error('⚙️ Erreur de configuration:', error.message);
      }
      
      setUser(null);
      setIsAdmin(false);
    } finally {
      console.log('🏁 getCurrentUser terminé - loading = false');
      setLoading(false);
    }
    
    console.log('🚀 === FIN getCurrentUser ===');
  }, []);

  // Initialisation avec surveillance du localStorage
  useEffect(() => {
    console.log('🎬 INITIALISATION useAuth hook');
    console.log('🔍 Token initial:', localStorage.getItem('token') ? 'PRÉSENT' : 'ABSENT');
    getCurrentUser();
  }, [getCurrentUser]);

  // Log des changements d'état
  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('📊 ÉTAT AUTH CHANGÉ:', {
      user: user ? { 
        id: user.id, 
        prenom: user.prenom, 
        nom: user.nom,
        role: user.role 
      } : null,
      isAdmin,
      loading,
      tokenStatus: {
        exists: !!token,
        length: token ? token.length : 0
      },
      isAuthenticated: isAuthenticated()
    });
  }, [user, isAdmin, loading, isAuthenticated]);

  // Fonctions utilitaires
  const logout = useCallback(() => {
    console.log('🚪 Déconnexion utilisateur');
    localStorage.removeItem('token');
    setUser(null);
    setIsAdmin(false);
  }, []);

  const login = useCallback((userData, token) => {
    console.log('🔐 Connexion manuelle:', { 
      userData: userData ? Object.keys(userData) : null, 
      hasToken: !!token 
    });
    
    if (token) {
      localStorage.setItem('token', token);
      console.log('💾 Token sauvegardé');
    }
    
    const userInfo = userData.user || userData;
    if (userInfo && (userInfo.id || userInfo._id)) {
      const user = {
        id: userInfo.id || userInfo._id,
        prenom: userInfo.prenom || userInfo.firstName || 'N/A',
        nom: userInfo.nom || userInfo.lastName || 'N/A',
        email: userInfo.email || 'N/A',
        role: userInfo.role || 'user'
      };
      
      setUser(user);
      setIsAdmin(user.role === 'admin');
      console.log('✅ Connexion manuelle réussie:', user);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    console.log('🔄 Rafraîchissement utilisateur demandé');
    setLoading(true);
    await getCurrentUser();
  }, [getCurrentUser]);

  const checkTokenValidity = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    try {
      const response = await axios.get('http://localhost:5000/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` },
        timeout: 5000
      });
      return response.status === 200;
    } catch (error) {
      console.log('❌ Token invalide lors de la vérification:', error.response?.status);
      return false;
    }
  }, []);

  const hasRole = useCallback((role) => {
    return user && user.role === role;
  }, [user]);

  return {
    user,
    isAdmin,
    loading,
    refreshUser,
    logout,
    login,
    isAuthenticated,
    hasRole,
    checkTokenValidity
  };
};