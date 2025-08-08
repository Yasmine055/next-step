// src/components/PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  // Afficher un loader pendant la vérification de l'authentification
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Chargement...</span>
        </div>
      </div>
    );
  }
  
  // Si pas authentifié, rediriger vers login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Si authentifié, afficher seulement le contenu (sans navbar)
  return children;
};

export default PrivateRoute;