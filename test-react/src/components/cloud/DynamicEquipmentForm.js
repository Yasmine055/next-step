import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  IconButton,
  Card,
  CardContent,
  Fade
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import DevicesIcon from '@mui/icons-material/Devices';
import SettingsIcon from '@mui/icons-material/Settings';
import Navbar from '../reseaux/navbar';

function DynamicEquipmentForm() {
  const { datacenterId, typeId } = useParams();
  const navigate = useNavigate();
  const [type, setType] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchType = async () => {
      try {
        if (!datacenterId || !typeId) {
          throw new Error('Paramètres manquants dans l\'URL');
        }

        // Charger les informations du type d'équipement
        console.log('Chargement du type d\'équipement...');
        const typeResponse = await axios.get(`http://localhost:5000/api/equipment-types/${typeId}`);
        if (!typeResponse.data) {
          throw new Error('Type d\'équipement non trouvé');
        }
        setType(typeResponse.data);
        setError('');
      } catch (err) {
        console.error('Erreur lors du chargement:', err);
        setError(err.response?.data?.message || err.message);
        
        // Rediriger vers la liste des équipements si l'erreur est critique
        if (err.response?.status === 404 || err.message.includes('Paramètres manquants')) {
          setTimeout(() => {
            navigate(`/datacenters/${datacenterId}/equipment-types/${typeId}/equipments`);
          }, 3000);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchType();
  }, [datacenterId, typeId, navigate]);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      console.log('Envoi des données:', { datacenterId, typeId, data: formData });
      const response = await axios.post('http://localhost:5000/api/equipments', {
        datacenterId,
        typeId,
        data: formData
      });
      console.log('Équipement créé:', response.data);
      setSuccess('Équipement créé avec succès');
      
      // Rediriger vers la liste des équipements après un court délai
      setTimeout(() => {
        navigate(`/datacenters/${datacenterId}/equipment-types/${typeId}/equipments`);
      }, 1500);
    } catch (err) {
      console.error('Erreur lors de la création:', err);
      setError(err.response?.data?.message || 'Erreur lors de la création de l\'équipement');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = type && type.fields.every(f => formData[f.name]?.trim());

  if (loading) {
    return (
      <>
        <Navbar />
        <Box sx={{ backgroundColor: '#f5f5f5', minHeight: 'calc(100vh - 64px)', py: 4 }}>
          <Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: 'auto', borderRadius: 3 }}>
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
              <CircularProgress size={60} sx={{ color: '#2487CE' }} />
            </Box>
          </Paper>
        </Box>
      </>
    );
  }

  if (!type) {
    return (
      <>
        <Navbar />
        <Box sx={{ backgroundColor: '#f5f5f5', minHeight: 'calc(100vh - 64px)', py: 4 }}>
          <Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: 'auto', borderRadius: 3 }}>
            <Alert 
              severity="error" 
              sx={{ borderRadius: 2 }}
              action={
                <Button 
                  color="inherit" 
                  size="small" 
                  onClick={() => navigate(`/datacenters/${datacenterId}/equipment-types/${typeId}/equipments`)}
                  sx={{ borderRadius: 2 }}
                >
                  Retour
                </Button>
              }
            >
              {error || 'Type d\'équipement non trouvé'}
            </Alert>
          </Paper>
        </Box>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Box sx={{ backgroundColor: '#f5f5f5', minHeight: 'calc(100vh - 64px)', py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: 'auto', borderRadius: 3 }}>
          {/* Header */}
          <Box display="flex" alignItems="center" gap={2} mb={4}>
            <IconButton
              onClick={() => navigate(`/datacenters/${datacenterId}/equipment-types/${typeId}/equipments`)}
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
                Ajouter un {type.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Remplissez les informations pour créer un nouvel équipement de type {type.name}
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
              <AddIcon sx={{ fontSize: 30, color: '#2487CE' }} />
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
            {/* Equipment Information Card */}
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
                    <DevicesIcon sx={{ fontSize: 20, color: '#2487CE' }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>
                    Informations de l'équipement
                  </Typography>
                </Box>

                {type.fields.map((field, idx) => (
                  <Box key={idx} sx={{ mb: 3 }}>
                    <TextField
                      fullWidth
                      label={field.label}
                      type={field.type}
                      value={formData[field.name] || ''}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': {
                            borderColor: '#2487CE',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#2487CE',
                          }
                        }
                      }}
                      {...(field.type === 'number' ? { 
                        inputProps: { min: 0, step: "1" }
                      } : {})}
                    />
                  </Box>
                ))}
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
              <Button
                variant="outlined"
                onClick={() => navigate(`/datacenters/${datacenterId}/equipment-types/${typeId}/equipments`)}
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
                {loading ? 'Création...' : "Ajouter l'équipement"}
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </>
  );
}

export default DynamicEquipmentForm;