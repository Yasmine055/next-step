import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  IconButton,
  Alert,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Divider,
  Fade,
  Chip
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import PersonIcon from '@mui/icons-material/Person';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SettingsIcon from '@mui/icons-material/Settings';
import Navbar from '../reseaux/navbar';

const API_URL = 'http://localhost:5000/api/users';

function UserForm({ editMode }) {
  const [form, setForm] = useState({
    prenom: '',
    nom: '',
    email: '',
    phone: '',
    password: '',
    role: 'user',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchUser = async () => {
      if (!editMode || !id) return;
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/${id}`);
        if (!res.ok) throw new Error('Erreur lors du chargement');
        const data = await res.json();
        setForm({ ...data, password: '' });
      } catch (err) {
        setError('Erreur lors du chargement de l\'utilisateur');
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [editMode, id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Préparer les données selon le mode
      const submitData = { ...form };
      
      // En mode édition, supprimer le mot de passe s'il est vide
      if (editMode && !submitData.password) {
        delete submitData.password;
      }

      console.log('Données envoyées:', submitData);

      const res = await fetch(editMode ? `${API_URL}/${id}` : API_URL, {
        method: editMode ? 'PUT' : 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(submitData),
      });
      
      if (!res.ok) {
        let errorMessage = 'Erreur lors de la sauvegarde';
        try {
          const errorData = await res.json();
          
          // Gestion spécifique des erreurs MongoDB
          if (errorData.message && errorData.message.includes('E11000 duplicate key error')) {
            if (errorData.message.includes('email_1')) {
              errorMessage = 'Cette adresse email est déjà utilisée par un autre utilisateur.';
            } else if (errorData.message.includes('phone_1')) {
              errorMessage = 'Ce numéro de téléphone est déjà utilisé par un autre utilisateur.';
            } else {
              errorMessage = 'Ces informations sont déjà utilisées par un autre utilisateur.';
            }
          } else if (errorData.message && errorData.message.includes('validation failed')) {
            errorMessage = 'Veuillez vérifier les informations saisies.';
          } else {
            errorMessage = errorData.message || errorData.error || errorMessage;
          }
        } catch (parseError) {
          errorMessage = `Erreur ${res.status}: ${res.statusText}`;
        }
        throw new Error(errorMessage);
      }
      
      setSuccess(editMode ? 'Utilisateur modifié avec succès' : 'Utilisateur créé avec succès');
      setTimeout(() => navigate('/users'), 1500);
    } catch (err) {
      console.error('Submit error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    return form.prenom && 
           form.nom && 
           form.email && 
           form.phone && 
           (editMode || form.password);
  };

  if (loading && editMode) {
    return (
      <>
        <Navbar />
        <Box sx={{ backgroundColor: '#f5f5f5', minHeight: 'calc(100vh - 64px)', py: 4 }}>
          <Paper elevation={3} sx={{ p: 4, maxWidth: 1000, mx: 'auto', borderRadius: 3 }}>
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
              <CircularProgress size={60} sx={{ color: '#2487CE' }} />
            </Box>
          </Paper>
        </Box>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Box sx={{ backgroundColor: '#f5f5f5', minHeight: 'calc(100vh - 64px)', py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, maxWidth: 1000, mx: 'auto', borderRadius: 3 }}>
          {/* Header */}
          <Box display="flex" alignItems="center" gap={2} mb={4}>
            <IconButton
              onClick={() => navigate('/users')}
              color="primary"
              sx={{
                backgroundColor: 'rgba(36, 135, 206, 0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(36, 135, 206, 0.2)',
                }
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h4" component="h1" sx={{ 
                color: '#2487CE', 
                fontWeight: 'bold',
                mb: 0.5
              }}>
                {editMode ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  {editMode ? 'Modifiez les informations de l\'utilisateur' : 'Créez un nouveau compte utilisateur'}
                </Typography>
                <Chip
                  label={editMode ? 'Édition' : 'Création'}
                  size="small"
                  sx={{
                    backgroundColor: editMode ? 'rgba(255, 152, 0, 0.1)' : 'rgba(76, 175, 80, 0.1)',
                    color: editMode ? '#FF9800' : '#4CAF50',
                    fontWeight: 'medium'
                  }}
                />
              </Box>
            </Box>
            {/* Icon Header */}
            <Box 
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 60,
                height: 60,
                backgroundColor: 'rgba(36, 135, 206, 0.1)',
                borderRadius: '50%',
              }}
            >
              {editMode ? (
                <PersonIcon sx={{ fontSize: 30, color: '#2487CE' }} />
              ) : (
                <PersonAddIcon sx={{ fontSize: 30, color: '#2487CE' }} />
              )}
            </Box>
          </Box>

          {/* Alerts */}
          <Fade in={!!error}>
            <Box sx={{ mb: 3 }}>
              {error && (
                <Alert severity="error" sx={{ borderRadius: 2 }}>
                  {error}
                </Alert>
              )}
            </Box>
          </Fade>

          <Fade in={!!success}>
            <Box sx={{ mb: 3 }}>
              {success && (
                <Alert severity="success" sx={{ borderRadius: 2 }}>
                  {success}
                </Alert>
              )}
            </Box>
          </Fade>

          {/* User Type Info Card */}
          <Card sx={{ 
            mb: 4, 
            borderRadius: 3,
            border: '1px solid rgba(0,0,0,0.08)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            backgroundColor: 'rgba(36, 135, 206, 0.02)'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box 
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 40,
                    height: 40,
                    backgroundColor: 'rgba(36, 135, 206, 0.1)',
                    borderRadius: '50%',
                  }}
                >
                  <PersonIcon sx={{ fontSize: 20, color: '#2487CE' }} />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>
                    {editMode ? 'Modification d\'utilisateur' : 'Création d\'utilisateur'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {editMode ? 'Mettez à jour les informations de l\'utilisateur' : 'Remplissez tous les champs requis pour créer le compte'}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <form onSubmit={handleSubmit}>
            {/* User Fields Card */}
            <Card sx={{ 
              borderRadius: 3,
              border: '1px solid rgba(0,0,0,0.08)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Box 
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 40,
                      height: 40,
                      backgroundColor: 'rgba(36, 135, 206, 0.1)',
                      borderRadius: '50%',
                    }}
                  >
                    <SettingsIcon sx={{ fontSize: 20, color: '#2487CE' }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>
                    Informations personnelles
                  </Typography>
                </Box>

                <Divider sx={{ mb: 3 }} />

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* Prénom */}
                  <Card sx={{ 
                    backgroundColor: '#f8f9fa',
                    borderRadius: 2,
                    border: '1px solid rgba(0,0,0,0.05)'
                  }}>
                    <CardContent sx={{ p: 2 }}>
                      <TextField
                        fullWidth
                        label="Prénom"
                        name="prenom"
                        value={form.prenom}
                        onChange={handleChange}
                        required
                        disabled={loading}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            backgroundColor: 'white',
                            '&:hover fieldset': {
                              borderColor: '#2487CE',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#2487CE',
                            }
                          }
                        }}
                      />
                    </CardContent>
                  </Card>

                  {/* Nom */}
                  <Card sx={{ 
                    backgroundColor: '#f8f9fa',
                    borderRadius: 2,
                    border: '1px solid rgba(0,0,0,0.05)'
                  }}>
                    <CardContent sx={{ p: 2 }}>
                      <TextField
                        fullWidth
                        label="Nom"
                        name="nom"
                        value={form.nom}
                        onChange={handleChange}
                        required
                        disabled={loading}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            backgroundColor: 'white',
                            '&:hover fieldset': {
                              borderColor: '#2487CE',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#2487CE',
                            }
                          }
                        }}
                      />
                    </CardContent>
                  </Card>

                  {/* Email */}
                  <Card sx={{ 
                    backgroundColor: '#f8f9fa',
                    borderRadius: 2,
                    border: '1px solid rgba(0,0,0,0.05)'
                  }}>
                    <CardContent sx={{ p: 2 }}>
                      <TextField
                        fullWidth
                        label="Email"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        disabled={loading}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            backgroundColor: 'white',
                            '&:hover fieldset': {
                              borderColor: '#2487CE',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#2487CE',
                            }
                          }
                        }}
                      />
                    </CardContent>
                  </Card>

                  {/* Téléphone */}
                  <Card sx={{ 
                    backgroundColor: '#f8f9fa',
                    borderRadius: 2,
                    border: '1px solid rgba(0,0,0,0.05)'
                  }}>
                    <CardContent sx={{ p: 2 }}>
                      <TextField
                        fullWidth
                        label="Téléphone"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        required
                        disabled={loading}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            backgroundColor: 'white',
                            '&:hover fieldset': {
                              borderColor: '#2487CE',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#2487CE',
                            }
                          }
                        }}
                      />
                    </CardContent>
                  </Card>

                  {/* Mot de passe */}
                  <Card sx={{ 
                    backgroundColor: '#f8f9fa',
                    borderRadius: 2,
                    border: '1px solid rgba(0,0,0,0.05)'
                  }}>
                    <CardContent sx={{ p: 2 }}>
                      <TextField
                        fullWidth
                        label="Mot de passe"
                        name="password"
                        type="password"
                        value={form.password}
                        onChange={handleChange}
                        required={!editMode}
                        disabled={loading}
                        helperText={editMode ? "Laissez vide pour conserver le mot de passe actuel" : ""}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            backgroundColor: 'white',
                            '&:hover fieldset': {
                              borderColor: '#2487CE',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#2487CE',
                            }
                          }
                        }}
                      />
                    </CardContent>
                  </Card>

                  {/* Rôle */}
                  <Card sx={{ 
                    backgroundColor: '#f8f9fa',
                    borderRadius: 2,
                    border: '1px solid rgba(0,0,0,0.05)'
                  }}>
                    <CardContent sx={{ p: 2 }}>
                      <FormControl 
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            backgroundColor: 'white',
                            '&:hover fieldset': {
                              borderColor: '#2487CE',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#2487CE',
                            }
                          }
                        }}
                      >
                        <InputLabel id="role-select-label">Rôle</InputLabel>
                        <Select
                          labelId="role-select-label"
                          name="role"
                          value={form.role}
                          onChange={handleChange}
                          label="Rôle"
                          required
                          disabled={loading}
                        >
                          <MenuItem value="user">Utilisateur</MenuItem>
                          <MenuItem value="admin">Admin</MenuItem>
                        </Select>
                      </FormControl>
                    </CardContent>
                  </Card>
                </Box>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/users')}
                disabled={loading}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  py: 1.5,
                  borderColor: 'rgba(0, 0, 0, 0.23)',
                  color: 'text.secondary',
                  '&:hover': {
                    borderColor: 'rgba(0, 0, 0, 0.4)',
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  }
                }}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading || !isFormValid()}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                sx={{
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                  backgroundColor: '#2487CE',
                  fontWeight: 'bold',
                  '&:hover': {
                    backgroundColor: '#1a6da8',
                  },
                  '&.Mui-disabled': {
                    backgroundColor: 'rgba(0, 0, 0, 0.12)',
                  }
                }}
              >
                {loading ? (editMode ? 'Modification...' : 'Création...') : (editMode ? 'Mettre à jour' : 'Créer l\'utilisateur')}
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </>
  );
}

export default UserForm;