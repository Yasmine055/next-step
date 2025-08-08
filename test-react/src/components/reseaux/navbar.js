// src/components/reseaux/navbar.js
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logo from '../../assets/images/navbar.png';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  // Fonction pour vérifier si un lien est actif
  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  // Fonction de déconnexion
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      {/* Navbar principale */}
      <div className="container-fluid p-0">
        <nav className="navbar navbar-expand-lg bg-white navbar-light py-3 py-lg-0 px-lg-5">
        <Link to="/" className="navbar-brand ml-lg-3 d-flex align-items-center">
  <img 
    src={logo} 
    alt="Logo Next Step" 
    style={{ 
      height: '60px', 
      width: 'auto', 
      marginRight: '15px'
    }} 
  />
 
</Link>

          <button
            className="navbar-toggler"
            type="button"
            data-toggle="collapse"
            data-target="#navbarCollapse"
            aria-controls="navbarCollapse"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse justify-content-between px-lg-3" id="navbarCollapse">
            <div className="navbar-nav mx-auto py-0">
            
              
              
              <Link 
                to="/profile" 
                className={`nav-item nav-link ${isActive('/courses') ? 'active' : ''}`}
              >
                Mon Profil
              </Link>

              <Link 
                to="/datacenters" 
                className={`nav-item nav-link ${isActive('/courses') ? 'active' : ''}`}
              >
                Equipe Cloud
              </Link>

              <Link 
                to="/reseau/types" 
                className={`nav-item nav-link ${isActive('/courses') ? 'active' : ''}`}
              >
                Equipe Réseau
              </Link>

              {/* Afficher le lien Liste Users uniquement pour les administrateurs */}
              {user && user.role === 'admin' && (
                <Link 
                  to="/users" 
                  className={`nav-item nav-link ${isActive('/users') ? 'active' : ''}`}
                >
                  Liste Users
                </Link>
              )}
           
              <div className="nav-item dropdown">
              
                <div className="dropdown-menu" aria-labelledby="navbarDropdown">
                  <Link to="/serveurs" className="dropdown-item">Liste des VM</Link>
                </div>
              </div>
            </div>
            
            <button 
              onClick={handleLogout}
              className="btn py-2 px-4 d-none d-lg-block" 
              style={{ backgroundColor: '#11366b', color: 'white', border: 'none' }}
            >
              Déconnexion
            </button>
          </div>
        </nav>
      </div>

      {/* Styles CSS pour les liens actifs et responsive */}
      <style jsx>{`
        .nav-link.active {
          color: #2487CE !important;
          font-weight: bold;
          background-color: rgba(36, 135, 206, 0.1);
          border-radius: 4px;
        }
        
        .nav-link:hover {
          color: #2487CE !important;
          transition: color 0.3s ease;
        }
        
        .btn:hover {
          background-color: #1a6da8 !important;
          transition: background-color 0.3s ease;
          cursor: pointer;
        }

        /* Responsive pour mobile */
        @media (max-width: 991px) {
          .navbar-brand img {
            height: 35px !important;
            margin-right: 8px !important;
          }
          .navbar-brand h1 {
            font-size: 1.5rem !important;
          }
        }
        
        @media (max-width: 576px) {
          .navbar-brand img {
            height: 30px !important;
            margin-right: 6px !important;
          }
          .navbar-brand h1 {
            font-size: 1.3rem !important;
          }
        }
      `}</style>
    </>
  );
};

export default Navbar;