import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
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
  Fade
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import RouterIcon from '@mui/icons-material/Router';
import SettingsIcon from '@mui/icons-material/Settings';
import Navbar from '../reseaux/navbar';

function ReseauEquipmentTypeForm() {
  const { id } = useParams(); // id du type 
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [fields, setFields] = useState([{ name: '', type: 'text', label: '' }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchType = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:5000/api/reseau-equipment-types/${id}`);
        const { name, fields } = res.data;
        setName(name);
        setFields(fields);
      } catch (err) {
        setError("Erreur lors du chargement du type d'équipement réseau");
      } finally {
        setLoading(false);
      }
    };
    fetchType();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const data = {
        name,
        fields: fields.map(field => ({
          name: field.name.toLowerCase().replace(/\s+/g, '_'),
          type: field.type,
          label: field.label
        }))
      };

      if (id) {
        await axios.put(`http://localhost:5000/api/reseau-equipment-types/${id}`, data);
        setSuccess("Type modifié avec succès");
      } else {
        await axios.post('http://localhost:5000/api/reseau-equipment-types', data);
        setSuccess("Type créé avec succès");
      }

      setTimeout(() => navigate('/reseau/types'), 1500);
    } catch (err) {
      setError("Erreur lors de l'enregistrement du type d'équipement");
    } finally {
      setLoading(false);
    }
  };

  const addField = () => setFields([...fields, { name: '', type: 'text', label: '' }]);
  const removeField = (index) => setFields(fields.filter((_, i) => i !== index));
  const updateField = (index, field) => {
    const updated = [...fields];
    updated[index] = { ...updated[index], ...field };
    setFields(updated);
  };

  const isFormValid = name.trim() && fields.every(f => f.name.trim() && f.label.trim());

  return (
    <>
      <Navbar />
      <Box sx={{ backgroundColor: '#f5f5f5', minHeight: 'calc(100vh - 64px)', py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, maxWidth: 1000, mx: 'auto', borderRadius: 3 }}>
          {/* Header */}
          <Box display="flex" alignItems="center" gap={2} mb={4}>
            <IconButton
              onClick={() => navigate('/reseau/types')}
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
                {id ? 'Modifier le type d\'équipement réseau' : 'Nouveau type d\'équipement réseau'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {id ? 'Modifiez les paramètres de ce type d\'équipement' : 'Créez un nouveau type d\'équipement avec ses champs personnalisés'}
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
              {id ? <EditIcon sx={{ fontSize: 30, color: '#2487CE' }} /> : <RouterIcon sx={{ fontSize: 30, color: '#2487CE' }} />}
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
                <TextField
                  fullWidth
                  label="Nom du type d'équipement"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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
                />
              </CardContent>
            </Card>

            {/* Fields Configuration Card */}
            <Card sx={{ 
              borderRadius: 3,
              border: '1px solid rgba(0,0,0,0.08)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
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
                      <SettingsIcon sx={{ fontSize: 20, color: '#2487CE' }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>
                      Champs personnalisés
                    </Typography>
                  </Box>
                  <Button
                    type="button"
                    startIcon={<AddIcon />}
                    onClick={addField}
                    variant="outlined"
                    sx={{
                      borderRadius: 2,
                      borderColor: '#2487CE',
                      color: '#2487CE',
                      '&:hover': {
                        borderColor: '#1a6da8',
                        backgroundColor: 'rgba(36, 135, 206, 0.05)',
                      }
                    }}
                  >
                    Ajouter un champ
                  </Button>
                </Box>

                <Divider sx={{ mb: 3 }} />

                {fields.map((field, index) => (
                  <Card key={index} sx={{ 
                    mb: 2, 
                    backgroundColor: '#f8f9fa',
                    borderRadius: 2,
                    border: '1px solid rgba(0,0,0,0.05)'
                  }}>
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'start' }}>
                        <TextField
                          label="Nom du champ"
                          value={field.name}
                          onChange={(e) => updateField(index, { name: e.target.value })}
                          required
                          sx={{ 
                            flex: 1,
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
                        <FormControl sx={{ 
                          width: 150,
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
                        }}>
                          <InputLabel>Type</InputLabel>
                          <Select
                            value={field.type}
                            onChange={(e) => updateField(index, { type: e.target.value })}
                            label="Type"
                            required
                          >
                            <MenuItem value="text">Texte</MenuItem>
                            <MenuItem value="number">Nombre</MenuItem>
                            <MenuItem value="date">Date</MenuItem>
                            <MenuItem value="email">Email</MenuItem>
                          </Select>
                        </FormControl>
                        <TextField
                          label="Libellé"
                          value={field.label}
                          onChange={(e) => updateField(index, { label: e.target.value })}
                          required
                          sx={{ 
                            flex: 1,
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
                        <IconButton
                          color="error"
                          onClick={() => removeField(index)}
                          disabled={fields.length === 1}
                          sx={{
                            backgroundColor: 'rgba(244, 67, 54, 0.1)',
                            '&:hover': {
                              backgroundColor: 'rgba(244, 67, 54, 0.2)',
                            },
                            '&.Mui-disabled': {
                              backgroundColor: 'rgba(0, 0, 0, 0.05)',
                            }
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/reseau/types')}
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
                {loading ? 'Enregistrement...' : (id ? 'Modifier le type' : 'Créer le type')}
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </>
  );
}

export default ReseauEquipmentTypeForm;