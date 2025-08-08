import React, { useEffect, useState } from 'react';
import Navbar from '../reseaux/navbar';
import { useAuth } from '../contexts/AuthContext';

const API_URL = 'http://localhost:5000/api/users';

function UserList() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [statistics, setStatistics] = useState({
    total: 0,
    admins: 0,
    standardUsers: 0
  });

  // Fonction de navigation compatible avec ou sans React Router
  const navigateTo = (path) => {
    try {
      window.location.href = path;
    } catch (error) {
      window.location.href = path;
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL);
      const data = await res.json();
      setUsers(data);
      
      // Calculer les statistiques
      const total = data.length;
      const admins = data.filter(user => user.role === 'admin').length;
      const standardUsers = data.filter(user => user.role === 'user').length;
      
      setStatistics({
        total,
        admins,
        standardUsers
      });
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      fetchUsers();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression de l\'utilisateur');
    }
  };

  const handleAddUser = () => {
    navigateTo('/users/add');
  };

  const handleEditUser = (userId) => {
    navigateTo(`/users/edit/${userId}`);
  };

  // Filtrage des utilisateurs
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="page-container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Chargement des données...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="page-container">
        {/* Hero Section */}
        <div className="hero-section">
          <div className="container">
            <div className="hero-content">
              <div className="hero-text">
                <div className="hero-icon">
                  <i className="fas fa-users"></i>
                </div>
                <h1 className="hero-title">Gestion des Utilisateurs</h1>
                <p className="hero-subtitle">
                  Administrez et gérez efficacement tous les utilisateurs de votre plateforme
                </p>
              </div>
              <div className="hero-actions">
                {user && user.role === 'admin' && (
                  <button onClick={handleAddUser} className="btn-primary-hero">
                    <i className="fas fa-user-plus"></i>
                    Ajouter un utilisateur
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="container main-content">
          {/* Statistics Dashboard */}
          <div className="stats-dashboard">
            <div className="stats-grid">
              <div className="stat-card primary">
                <div className="stat-icon">
                  <i className="fas fa-users"></i>
                </div>
                <div className="stat-content">
                  <div className="stat-number">{statistics.total}</div>
                  <div className="stat-label">Utilisateurs total</div>
                </div>
                <div className="stat-trend">
                  <i className="fas fa-arrow-up"></i>
                </div>
              </div>
              
              <div className="stat-card success">
                <div className="stat-icon">
                  <i className="fas fa-crown"></i>
                </div>
                <div className="stat-content">
                  <div className="stat-number">{statistics.admins}</div>
                  <div className="stat-label">Administrateurs</div>
                </div>
                <div className="stat-trend">
                  <i className="fas fa-shield-alt"></i>
                </div>
              </div>
              
              <div className="stat-card neutral">
                <div className="stat-icon">
                  <i className="fas fa-user"></i>
                </div>
                <div className="stat-content">
                  <div className="stat-number">{statistics.standardUsers}</div>
                  <div className="stat-label">Utilisateurs standard</div>
                </div>
                <div className="stat-trend">
                  <i className="fas fa-user-friends"></i>
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="filters-section">
            <div className="filters-container">
              <div className="search-container">
                <div className="search-input-wrapper">
                  <i className="fas fa-search search-icon"></i>
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Rechercher par nom, prénom ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="filter-container">
                <select
                  className="filter-select"
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                >
                  <option value="all">Tous les rôles</option>
                  <option value="admin">Administrateurs</option>
                  <option value="user">Utilisateurs</option>
                </select>
              </div>
            </div>
          </div>

          {/* Users Grid */}
          <div className="users-section">
            <div className="section-header">
              <h2 className="section-title">
                <i className="fas fa-list"></i>
                Liste des utilisateurs
              </h2>
              <div className="results-count">
                {filteredUsers.length} résultat{filteredUsers.length !== 1 ? 's' : ''}
              </div>
            </div>

            {filteredUsers.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <i className="fas fa-user-slash"></i>
                </div>
                <h3 className="empty-title">Aucun utilisateur trouvé</h3>
                <p className="empty-description">
                  {searchTerm || filterRole !== 'all' 
                    ? 'Essayez de modifier vos critères de recherche'
                    : 'Commencez par ajouter votre premier utilisateur'
                  }
                </p>
                {!searchTerm && filterRole === 'all' && user && user.role === 'admin' && (
                  <button onClick={handleAddUser} className="btn-empty-action">
                    <i className="fas fa-plus"></i>
                    Ajouter le premier utilisateur
                  </button>
                )}
              </div>
            ) : (
              <div className="users-grid">
                {filteredUsers.map((user) => (
                  <div key={user._id} className="user-card">
                    <div className="user-card-header">
                      <div className="user-avatar">
                        <span className="avatar-text">
                          {user.prenom?.charAt(0)?.toUpperCase() || 'U'}
                          {user.nom?.charAt(0)?.toUpperCase() || ''}
                        </span>
                      </div>
                      <div className="user-status">
                        <span className={`status-badge ${user.role}`}>
                          <i className={`fas ${user.role === 'admin' ? 'fa-crown' : 'fa-user'}`}></i>
                          {user.role === 'admin' ? 'Admin' : 'User'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="user-card-body">
                      <h3 className="user-name">
                        {user.prenom} {user.nom}
                      </h3>
                      <div className="user-info">
                        <div className="info-item">
                          <i className="fas fa-envelope"></i>
                          <span>{user.email}</span>
                        </div>
                        {user.phone && (
                          <div className="info-item">
                            <i className="fas fa-phone"></i>
                            <span>{user.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {user && user.role === 'admin' && (
                      <div className="user-card-actions">
                        <button 
                          onClick={() => handleEditUser(user._id)}
                          className="action-btn edit-btn"
                          title="Modifier"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button 
                          onClick={() => handleDelete(user._id)}
                          className="action-btn delete-btn"
                          title="Supprimer"
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .page-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        /* Loading States */
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
        }

        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #2487CE;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .loading-text {
          margin-top: 20px;
          color: #666;
          font-size: 16px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Hero Section */
        .hero-section {
          background: linear-gradient(135deg, #2487CE 0%, #1a6da8 100%);
          color: white;
          padding: 60px 0;
          position: relative;
          overflow: hidden;
        }

        .hero-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="%23ffffff" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="%23ffffff" opacity="0.1"/><circle cx="50" cy="10" r="1" fill="%23ffffff" opacity="0.05"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
        }

        .hero-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
          z-index: 2;
        }

        .hero-text {
          flex: 1;
        }

        .hero-icon {
          width: 70px;
          height: 70px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 30px;
          margin-bottom: 20px;
          backdrop-filter: blur(10px);
        }

        .hero-title {
          font-size: 48px;
          font-weight: 800;
          margin: 0 0 15px 0;
          text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .hero-subtitle {
          font-size: 18px;
          opacity: 0.9;
          margin: 0;
          line-height: 1.6;
        }

        .btn-primary-hero {
          background: white;
          color: #2487CE;
          border: none;
          padding: 15px 30px;
          border-radius: 50px;
          font-size: 16px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }

        .btn-primary-hero:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }

        /* Main Content */
        .main-content {
          margin-top: -40px;
          position: relative;
          z-index: 3;
        }

        /* Statistics Dashboard */
        .stats-dashboard {
          margin-bottom: 40px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
        }

        .stat-card {
          background: white;
          border-radius: 20px;
          padding: 30px;
          display: flex;
          align-items: center;
          gap: 20px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 4px;
          height: 100%;
          transition: width 0.3s ease;
        }

        .stat-card.primary::before { background: #2487CE; }
        .stat-card.success::before { background: #28a745; }
        .stat-card.neutral::before { background: #6c757d; }

        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 40px rgba(0,0,0,0.15);
        }

        .stat-card:hover::before {
          width: 8px;
        }

        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          color: white;
        }

        .stat-card.primary .stat-icon { background: linear-gradient(135deg, #2487CE, #1a6da8); }
        .stat-card.success .stat-icon { background: linear-gradient(135deg, #28a745, #20c997); }
        .stat-card.neutral .stat-icon { background: linear-gradient(135deg, #6c757d, #495057); }

        .stat-content {
          flex: 1;
        }

        .stat-number {
          font-size: 36px;
          font-weight: 800;
          color: #333;
          margin-bottom: 5px;
        }

        .stat-label {
          font-size: 14px;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 600;
        }

        .stat-trend {
          font-size: 20px;
          opacity: 0.3;
        }

        /* Filters Section */
        .filters-section {
          margin-bottom: 30px;
        }

        .filters-container {
          background: white;
          border-radius: 15px;
          padding: 25px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.08);
          display: flex;
          gap: 20px;
          align-items: center;
        }

        .search-container {
          flex: 1;
        }

        .search-input-wrapper {
          position: relative;
        }

        .search-icon {
          position: absolute;
          left: 15px;
          top: 50%;
          transform: translateY(-50%);
          color: #666;
          font-size: 16px;
        }

        .search-input {
          width: 100%;
          padding: 12px 15px 12px 45px;
          border: 2px solid #e9ecef;
          border-radius: 25px;
          font-size: 16px;
          transition: all 0.3s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: #2487CE;
          box-shadow: 0 0 0 3px rgba(36, 135, 206, 0.1);
        }

        .filter-select {
          padding: 12px 20px;
          border: 2px solid #e9ecef;
          border-radius: 25px;
          font-size: 16px;
          background: white;
          cursor: pointer;
          transition: all 0.3s ease;
          min-width: 200px;
        }

        .filter-select:focus {
          outline: none;
          border-color: #2487CE;
          box-shadow: 0 0 0 3px rgba(36, 135, 206, 0.1);
        }

        /* Users Section */
        .users-section {
          background: white;
          border-radius: 20px;
          padding: 30px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }

        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #f8f9fa;
        }

        .section-title {
          font-size: 24px;
          font-weight: 700;
          color: #333;
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0;
        }

        .section-title i {
          color: #2487CE;
        }

        .results-count {
          background: #f8f9fa;
          padding: 8px 15px;
          border-radius: 20px;
          font-size: 14px;
          color: #666;
          font-weight: 600;
        }

        /* Users Grid */
        .users-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
        }

        .user-card {
          background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
          border-radius: 15px;
          padding: 25px;
          transition: all 0.3s ease;
          border: 1px solid #e9ecef;
          position: relative;
          overflow: hidden;
        }

        .user-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #2487CE, #1a6da8);
          transform: scaleX(0);
          transition: transform 0.3s ease;
        }

        .user-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 35px rgba(0,0,0,0.1);
        }

        .user-card:hover::before {
          transform: scaleX(1);
        }

        .user-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .user-avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #2487CE, #1a6da8);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 18px;
        }

        .status-badge {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .status-badge.admin {
          background: rgba(40, 167, 69, 0.1);
          color: #28a745;
        }

        .status-badge.user {
          background: rgba(108, 117, 125, 0.1);
          color: #6c757d;
        }

        .user-card-body {
          margin-bottom: 20px;
        }

        .user-name {
          font-size: 20px;
          font-weight: 600;
          color: #333;
          margin: 0 0 15px 0;
        }

        .user-info {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .info-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          color: #666;
        }

        .info-item i {
          width: 16px;
          color: #2487CE;
        }

        .user-card-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
          padding-top: 20px;
          border-top: 1px solid #f0f0f0;
        }

        .action-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 16px;
        }

        .edit-btn {
          background: rgba(0, 123, 255, 0.1);
          color: #007bff;
        }

        .edit-btn:hover {
          background: #007bff;
          color: white;
          transform: scale(1.1);
        }

        .delete-btn {
          background: rgba(220, 53, 69, 0.1);
          color: #dc3545;
        }

        .delete-btn:hover {
          background: #dc3545;
          color: white;
          transform: scale(1.1);
        }

        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 60px 20px;
        }

        .empty-icon {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: linear-gradient(135deg, #f8f9fa, #e9ecef);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          font-size: 40px;
          color: #adb5bd;
        }

        .empty-title {
          font-size: 24px;
          font-weight: 600;
          color: #495057;
          margin: 0 0 10px 0;
        }

        .empty-description {
          font-size: 16px;
          color: #6c757d;
          margin: 0 0 30px 0;
          line-height: 1.5;
        }

        .btn-empty-action {
          background: linear-gradient(135deg, #2487CE, #1a6da8);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 25px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .btn-empty-action:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(36, 135, 206, 0.3);
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .hero-content {
            flex-direction: column;
            text-align: center;
            gap: 30px;
          }

          .hero-title {
            font-size: 36px;
          }

          .filters-container {
            flex-direction: column;
            gap: 15px;
          }

          .filter-select {
            min-width: auto;
            width: 100%;
          }

          .users-grid {
            grid-template-columns: 1fr;
          }

          .section-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
          }
        }

        @media (max-width: 480px) {
          .container {
            padding: 0 15px;
          }

          .hero-section {
            padding: 40px 0;
          }

          .hero-title {
            font-size: 28px;
          }

          .hero-subtitle {
            font-size: 16px;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .user-card {
            padding: 20px;
          }
        }
      `}</style>
    </>
  );
}

export default UserList;