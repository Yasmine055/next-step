import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../reseaux/navbar';

const API_URL = 'http://localhost:5000/api';

function UserProfile() {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.clear();
          navigate('/login');
          return;
        }
        throw new Error('Erreur lors du chargement du profil');
      }

      const data = await response.json();
      setUser(data.user);
      setFormData({
        nom: data.user.nom || '',
        prenom: data.user.prenom || '',
        email: data.user.email || '',
        phone: data.user.phone || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
        throw new Error('Les mots de passe ne correspondent pas');
      }

      if (formData.newPassword && formData.newPassword.length < 6) {
        throw new Error('Le nouveau mot de passe doit contenir au moins 6 caractères');
      }

      const token = localStorage.getItem('token');
      const updateData = {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        phone: formData.phone
      };

      if (formData.currentPassword && formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error('Response is not JSON:', textResponse);
        throw new Error('Le serveur a retourné une réponse non-JSON.');
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la mise à jour');
      }

      const data = await response.json();
      setUser(data.user);
      setSuccess('Profil mis à jour avec succès');
      setEditMode(false);
      
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));

      localStorage.setItem('userName', `${data.user.prenom} ${data.user.nom}`);

    } catch (err) {
      console.error('Handle save error:', err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setError('');
    setSuccess('');
    if (user) {
      setFormData({
        nom: user.nom || '',
        prenom: user.prenom || '',
        email: user.email || '',
        phone: user.phone || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  };

  const getInitials = (prenom, nom) => {
    return `${prenom?.charAt(0) || ''}${nom?.charAt(0) || ''}`.toUpperCase();
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return '#28a745';
      case 'user': return '#6c757d';
      default: return '#9e9e9e';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin': return 'Administrateur';
      case 'user': return 'Utilisateur';
      default: return 'Inconnu';
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="page-container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Chargement du profil...</p>
          </div>
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="page-container">
          <div className="error-container">
            <div className="error-icon">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <h3>Impossible de charger le profil</h3>
            <p>Une erreur s'est produite lors du chargement de vos informations.</p>
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
            <div className="profile-hero">
              <div className="profile-avatar-section">
                <div className="profile-avatar">
                  <span className="avatar-text">
                    {getInitials(user.prenom, user.nom)}
                  </span>
                </div>
                <div className="profile-info">
                  <h1 className="profile-name">{user.prenom} {user.nom}</h1>
                  <div className="profile-meta">
                    <span className={`role-badge ${user.role}`}>
                      <i className={`fas ${user.role === 'admin' ? 'fa-crown' : 'fa-user'}`}></i>
                      {getRoleLabel(user.role)}
                    </span>
                    <span className="member-since">
                      <i className="fas fa-calendar-alt"></i>
                      Membre depuis {new Date(user.createdAt || Date.now()).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>
              </div>
              <div className="profile-actions">
                <button
                  onClick={() => setEditMode(!editMode)}
                  className={`btn-hero ${editMode ? 'cancel' : 'edit'}`}
                >
                  <i className={`fas ${editMode ? 'fa-times' : 'fa-edit'}`}></i>
                  {editMode ? 'Annuler' : 'Modifier'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="container main-content">
          {/* Messages d'alerte */}
          {error && (
            <div className="alert alert-error">
              <i className="fas fa-exclamation-circle"></i>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              <i className="fas fa-check-circle"></i>
              <span>{success}</span>
            </div>
          )}

          {/* Section Informations personnelles */}
          <div className="profile-section">
            <div className="section-header">
              <h2 className="section-title">
                <i className="fas fa-user"></i>
                Informations personnelles
              </h2>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  <i className="fas fa-user"></i>
                  Prénom
                </label>
                <input
                  type="text"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  className="form-input"
                  placeholder="Votre prénom"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <i className="fas fa-user"></i>
                  Nom
                </label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  className="form-input"
                  placeholder="Votre nom"
                />
              </div>

              <div className="form-group full-width">
                <label className="form-label">
                  <i className="fas fa-envelope"></i>
                  Adresse email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  className="form-input"
                  placeholder="votre@email.com"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <i className="fas fa-phone"></i>
                  Téléphone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  className="form-input"
                  placeholder="+33 1 23 45 67 89"
                />
              </div>
            </div>
          </div>

          {/* Section Changement de mot de passe */}
          {editMode && (
            <div className="profile-section">
              <div className="section-header">
                <h2 className="section-title">
                  <i className="fas fa-lock"></i>
                  Sécurité du compte
                </h2>
                <p className="section-subtitle">
                  Laissez vide pour conserver votre mot de passe actuel
                </p>
              </div>

              <div className="form-grid">
                <div className="form-group full-width">
                  <label className="form-label">
                    <i className="fas fa-key"></i>
                    Mot de passe actuel
                  </label>
                  <div className="password-input-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Votre mot de passe actuel"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <i className="fas fa-lock"></i>
                    Nouveau mot de passe
                  </label>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Au moins 6 caractères"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <i className="fas fa-check-double"></i>
                    Confirmer le mot de passe
                  </label>
                  <div className="password-input-wrapper">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Confirmez votre nouveau mot de passe"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Boutons d'action */}
          {editMode && (
            <div className="actions-section">
              <div className="actions-container">
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="btn-secondary"
                >
                  <i className="fas fa-times"></i>
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-primary"
                >
                  {saving ? (
                    <>
                      <div className="btn-spinner"></div>
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save"></i>
                      Enregistrer les modifications
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .page-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        }

        .container {
          max-width: 900px;
          margin: 0 auto;
          padding: 0 20px;
        }

        /* Loading States */
        .loading-container, .error-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          text-align: center;
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

        .error-icon {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ff6b6b, #ee5a24);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 30px;
          color: white;
          margin-bottom: 20px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Hero Section */
        .hero-section {
          background: linear-gradient(135deg, #2487CE 0%, #1a6da8 100%);
          color: white;
          padding: 40px 0;
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
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="%23ffffff" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="%23ffffff" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
        }

        .profile-hero {
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
          z-index: 2;
        }

        .profile-avatar-section {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .profile-avatar {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 4px solid rgba(255, 255, 255, 0.3);
          backdrop-filter: blur(10px);
        }

        .avatar-text {
          font-size: 32px;
          font-weight: bold;
          color: white;
        }

        .profile-name {
          font-size: 32px;
          font-weight: 800;
          margin: 0 0 15px 0;
          text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .profile-meta {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .role-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          width: fit-content;
        }

.role-badge.admin {
  background: white;
  color: #28a745;
  border: 1px solid #28a745;
}

.role-badge.user {
  background: white;
  color: #343a40;
  border: 1px solid #343a40;
}



        .member-since {
          display: flex;
          align-items: center;
          gap: 8px;
          opacity: 0.9;
          font-size: 14px;
        }

        .btn-hero {
          padding: 12px 24px;
          border: none;
          border-radius: 25px;
          font-size: 16px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .btn-hero.edit {
          background: white;
          color: #2487CE;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }

        .btn-hero.edit:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }

        .btn-hero.cancel {
          background: rgba(244, 67, 54, 0.9);
          color: white;
          box-shadow: 0 4px 15px rgba(244, 67, 54, 0.3);
        }

        .btn-hero.cancel:hover {
          background: #f44336;
          transform: translateY(-2px);
        }

        /* Main Content */
        .main-content {
          margin-top: -20px;
          position: relative;
          z-index: 3;
        }

        /* Alerts */
        .alert {
          padding: 15px 20px;
          border-radius: 12px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 500;
        }

        .alert-error {
          background: linear-gradient(135deg, #ff6b6b, #ee5a24);
          color: white;
          box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
        }

        .alert-success {
          background: linear-gradient(135deg, #51cf66, #40c057);
          color: white;
          box-shadow: 0 4px 15px rgba(81, 207, 102, 0.3);
        }

        /* Profile Sections */
        .profile-section {
          background: white;
          border-radius: 20px;
          padding: 30px;
          margin-bottom: 20px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
        }

        .profile-section:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 40px rgba(0,0,0,0.15);
        }

        .section-header {
          margin-bottom: 30px;
        }

        .section-title {
          font-size: 24px;
          font-weight: 700;
          color: #333;
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 0 0 8px 0;
        }

        .section-title i {
          color: #2487CE;
        }

        .section-subtitle {
          color: #666;
          margin: 0;
          font-style: italic;
        }

        /* Form Styling */
        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }

        .form-group.full-width {
          grid-column: 1 / -1;
        }

        .form-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          color: #333;
          margin-bottom: 8px;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .form-label i {
          color: #2487CE;
          width: 16px;
        }

        .form-input {
          width: 100%;
          padding: 15px 18px;
          border: 2px solid #e9ecef;
          border-radius: 12px;
          font-size: 16px;
          transition: all 0.3s ease;
          background: white;
        }

        .form-input:focus {
          outline: none;
          border-color: #2487CE;
          box-shadow: 0 0 0 3px rgba(36, 135, 206, 0.1);
          transform: translateY(-1px);
        }

        .form-input:disabled {
          background: #f8f9fa;
          color: #6c757d;
          cursor: not-allowed;
        }

        .password-input-wrapper {
          position: relative;
        }

        .password-toggle {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #6c757d;
          padding: 8px;
          border-radius: 50%;
          transition: all 0.2s ease;
        }

        .password-toggle:hover {
          background: rgba(36, 135, 206, 0.1);
          color: #2487CE;
        }

        /* Actions Section */
        .actions-section {
          margin: 30px 0;
        }

        .actions-container {
          display: flex;
          gap: 15px;
          justify-content: flex-end;
          padding: 25px;
          background: white;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }

        .btn-primary, .btn-secondary {
          padding: 15px 30px;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .btn-primary {
          background: linear-gradient(135deg, #2487CE, #1a6da8);
          color: white;
          box-shadow: 0 4px 15px rgba(36, 135, 206, 0.3);
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(36, 135, 206, 0.4);
        }

        .btn-primary:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .btn-secondary {
          background: #f8f9fa;
          color: #6c757d;
          border: 2px solid #e9ecef;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #e9ecef;
          color: #495057;
          transform: translateY(-1px);
        }

        .btn-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .profile-hero {
            flex-direction: column;
            text-align: center;
            gap: 20px;
          }

          .profile-avatar-section {
            flex-direction: column;
            text-align: center;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .actions-container {
            flex-direction: column;
          }

          .profile-name {
            font-size: 28px;
          }

          .profile-meta {
            align-items: center;
          }
        }

        @media (max-width: 480px) {
          .container {
            padding: 0 15px;
          }

          .profile-section {
            padding: 20px;
          }

          .hero-section {
            padding: 30px 0;
          }

          .form-input {
            padding: 12px 15px;
          }

          .btn-primary, .btn-secondary {
            padding: 12px 20px;
            font-size: 14px;
          }
        }
      `}</style>
    </>
  );
}

export default UserProfile;