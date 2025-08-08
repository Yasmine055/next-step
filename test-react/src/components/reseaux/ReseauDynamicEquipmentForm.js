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
  Divider,
  Fade,
  Chip
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import RouterIcon from '@mui/icons-material/Router';
import DevicesIcon from '@mui/icons-material/Devices';
import SettingsIcon from '@mui/icons-material/Settings';
import Navbar from '../reseaux/navbar';

function ReseauDynamicEquipmentForm() {
  const { typeId } = useParams();
  const navigate = useNavigate();
  const [type, setType] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchType = async () => {
      try {
        if (!typeId) throw new Error('TypeId manquant');

        console.log('TypeId reçu:', typeId);
        const res = await axios.get(`http://localhost:5000/api/reseau-equipment-types/${typeId}`);
        if (!res.data) throw new Error("Type d'équipement réseau introuvable");

        console.log('Type récupéré:', res.data);
        setType(res.data);
        
        // Initialiser formData avec des valeurs vides pour tous les champs
        const initialFormData = {};
        res.data.fields?.forEach(field => {
          initialFormData[field.name] = '';
        });
        setFormData(initialFormData);
        
        setError('');
      } catch (err) {
        console.error('Erreur:', err);
        setError(err.response?.data?.message || err.message);
        setTimeout(() => navigate('/reseau/types'), 3000);
      } finally {
        setLoading(false);
      }
    };

    fetchType();
  }, [typeId, navigate]);

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
      // Validation côté client
      const missingFields = type.fields.filter(field => !formData[field.name] || formData[field.name].toString().trim() === '');
      if (missingFields.length > 0) {
        throw new Error(`Veuillez remplir tous les champs obligatoires: ${missingFields.map(f => f.label).join(', ')}`);
      }

      // Validation des types de données
      const processedFormData = {};
      type.fields.forEach(field => {
        const value = formData[field.name];
        if (field.type === 'number') {
          processedFormData[field.name] = Number(value);
        } else {
          processedFormData[field.name] = value;
        }
      });

      console.log('FormData traité:', processedFormData);

      // ✅ CORRECTION: Utiliser customFields au lieu de data
      const payload = {
        typeId,
        customFields: processedFormData  // ← CHANGEMENT ICI
      };

      console.log('Payload final:', JSON.stringify(payload, null, 2));

      const response = await axios.post('http://localhost:5000/api/reseau-equipments', payload);
      console.log('✅ Équipement créé avec succès:', response.data);

      setSuccess("Équipement réseau ajouté avec succès");

      setTimeout(() => {
        console.log('🔄 Redirection avec refresh vers:', `/reseau/types/${typeId}?refresh=${Date.now()}`);
        navigate(`/reseau/types/${typeId}?refresh=${Date.now()}`);
      }, 1500);
    } catch (err) {
      console.error('Erreur envoi:', err);
      console.error('Réponse du serveur:', err.response?.data);
      console.error('Status:', err.response?.status);
      
      let errorMessage = "Erreur lors de la création de l'équipement réseau";
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = type?.fields?.every(field => 
    formData[field.name] && formData[field.name].toString().trim() !== ''
  );

  if (loading) {
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

  if (!type) {
    return (
      <>
        <Navbar />
        <Box sx={{ backgroundColor: '#f5f5f5', minHeight: 'calc(100vh - 64px)', py: 4 }}>
          <Paper elevation={3} sx={{ p: 4, maxWidth: 1000, mx: 'auto', borderRadius: 3 }}>
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              {error || "Type d'équipement réseau non trouvé"}
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
        <Paper elevation={3} sx={{ p: 4, maxWidth: 1000, mx: 'auto', borderRadius: 3 }}>
          {/* Header */}
          <Box display="flex" alignItems="center" gap={2} mb={4}>
            <IconButton
              onClick={() => navigate(`/reseau/types/${typeId}`)}
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
                Ajouter un équipement
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Créez un nouvel équipement de type
                </Typography>
                <Chip
                  label={type.name}
                  size="small"
                  sx={{
                    backgroundColor: 'rgba(36, 135, 206, 0.1)',
                    color: '#2487CE',
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
              <DevicesIcon sx={{ fontSize: 30, color: '#2487CE' }} />
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

          {/* Equipment Type Info Card */}
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
                  <RouterIcon sx={{ fontSize: 20, color: '#2487CE' }} />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>
                    Type d'équipement: {type.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {type.fields?.length || 0} champ{type.fields?.length > 1 ? 's' : ''} à remplir
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <form onSubmit={handleSubmit}>
            {/* Equipment Fields Card */}
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
                    Informations de l'équipement
                  </Typography>
                </Box>

                <Divider sx={{ mb: 3 }} />

                {type.fields && type.fields.length > 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {type.fields.map((field, idx) => (
                      <Card key={idx} sx={{ 
                        backgroundColor: '#f8f9fa',
                        borderRadius: 2,
                        border: '1px solid rgba(0,0,0,0.05)'
                      }}>
                        <CardContent sx={{ p: 2 }}>
                          <TextField
                            fullWidth
                            label={field.label}
                            type={field.type || 'text'}
                            value={formData[field.name] || ''}
                            onChange={(e) => handleChange(field.name, e.target.value)}
                            required
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
                            {...(field.type === 'number' ? {
                              inputProps: { min: 0, step: '1' }
                            } : {})}
                          />
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                ) : (
                  <Alert severity="warning" sx={{ borderRadius: 2 }}>
                    Aucun champ défini pour ce type d'équipement
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
              <Button
                variant="outlined"
                onClick={() => navigate(`/reseau/types/${typeId}`)}
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
                disabled={loading || !type.fields || type.fields.length === 0 || !isFormValid}
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
                {loading ? 'Création en cours...' : "Créer l'équipement"}
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </>
  );
}

export default ReseauDynamicEquipmentForm;