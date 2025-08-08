import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  IconButton,
  Card,
  CardContent,
  Fade,
  Divider
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StorageIcon from '@mui/icons-material/Storage';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import SettingsIcon from '@mui/icons-material/Settings';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import Navbar from '../reseaux/navbar';

function DatacenterForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [nom, setNom] = useState('');
  const [emplacement, setEmplacement] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchDatacenter = async () => {
      if (!id) return;

      try {
        setLoading(true);
        console.log('Chargement du datacenter avec ID:', id);
        const response = await axios.get(`http://localhost:5000/api/datacenters/${id}`);
        console.log('Données reçues:', response.data);
        setNom(response.data.nom);
        setEmplacement(response.data.emplacement);
        setError('');
      } catch (err) {
        console.error('Erreur lors du chargement:', err);
        setError('Erreur lors du chargement du datacenter: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };

    fetchDatacenter();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      console.log('Envoi des données:', { nom, emplacement });
      
      if (id) {
        const response = await axios.put(`http://localhost:5000/api/datacenters/${id}`, { 
          nom, 
          emplacement 
        });
        console.log('Réponse de modification:', response.data);
        setSuccess('Datacenter modifié avec succès');
      } else {
        const response = await axios.post('http://localhost:5000/api/datacenters', { 
          nom, 
          emplacement 
        });
        console.log('Réponse de création:', response.data);
        setSuccess('Datacenter créé avec succès');
      }
      
      setTimeout(() => {
        navigate('/datacenters');
      }, 1500);
    } catch (err) {
      console.error('Erreur lors de l\'opération:', err);
      setError('Erreur lors de l\'enregistrement du datacenter: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = nom.trim() && emplacement.trim();

  if (loading && id) {
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
              onClick={() => navigate('/datacenters')}
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
                {id ? 'Modifier le datacenter' : 'Nouveau datacenter'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {id ? 'Modifiez les informations de ce datacenter' : 'Créez un nouveau datacenter pour organiser vos équipements'}
              </Typography>
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
              {id ? <EditIcon sx={{ fontSize: 30, color: '#2487CE' }} /> : <StorageIcon sx={{ fontSize: 30, color: '#2487CE' }} />}
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

          <form onSubmit={handleSubmit}>
            {/* Basic Information Card */}
            <Card sx={{ 
              mb: 4, 
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
                    Informations générales
                  </Typography>
                </Box>

                <Divider sx={{ mb: 3 }} />

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <TextField
                    fullWidth
                    label="Nom du datacenter"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    required
                    disabled={loading}
                    error={!nom && nom !== ''}
                    helperText={!nom && nom !== '' ? "Le nom est requis" : ""}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover fieldset': {
                          borderColor: '#2487CE',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#2487CE',
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#2487CE',
                      }
                    }}
                  />

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Box 
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 24,
                        height: 24,
                        backgroundColor: 'rgba(36, 135, 206, 0.1)',
                        borderRadius: '50%',
                      }}
                    >
                      <LocationOnIcon sx={{ fontSize: 14, color: '#2487CE' }} />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      Localisation
                    </Typography>
                  </Box>

                  <TextField
                    fullWidth
                    label="Emplacement"
                    value={emplacement}
                    onChange={(e) => setEmplacement(e.target.value)}
                    required
                    disabled={loading}
                    error={!emplacement && emplacement !== ''}
                    helperText={!emplacement && emplacement !== '' ? "L'emplacement est requis" : "Adresse complète du datacenter"}
                    multiline
                    rows={3}
                    placeholder="Saisissez l'adresse complète du datacenter..."
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover fieldset': {
                          borderColor: '#2487CE',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#2487CE',
                        }
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#2487CE',
                      }
                    }}
                  />
                </Box>
              </CardContent>
            </Card>

            {/* Submit Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/datacenters')}
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
                disabled={loading || !isFormValid}
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
                {loading ? 'Enregistrement...' : (id ? 'Modifier le datacenter' : 'Créer le datacenter')}
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </>
  );
}

export default DatacenterForm;