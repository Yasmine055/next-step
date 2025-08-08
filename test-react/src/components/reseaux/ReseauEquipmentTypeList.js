import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Button,
  IconButton,
  Card,
  CardContent,
  CardActions,
  Grid,
  Fab,
  Chip,
  Divider
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import RouterIcon from '@mui/icons-material/Router';
import DevicesIcon from '@mui/icons-material/Devices';
import Navbar from '../reseaux/navbar';

function ReseauEquipmentTypeList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [equipmentCounts, setEquipmentCounts] = useState({});

  const fetchEquipmentTypes = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/reseau-equipment-types');
      setEquipmentTypes(res.data);
      
      // Récupérer le nombre d'équipements pour chaque type
      const counts = {};
      for (const type of res.data) {
        try {
          const equipmentResponse = await axios.get(`http://localhost:5000/api/reseau/types/${type._id}/equipment`);
          counts[type._id] = equipmentResponse.data.length;
        } catch (err) {
          console.error('Erreur lors du comptage des équipements:', err);
          counts[type._id] = 0;
        }
      }
      setEquipmentCounts(counts);
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement des types d\'équipement réseau');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipmentTypes();
  }, []);

  const handleDelete = async (typeId, event) => {
    event.stopPropagation();
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce type d\'équipement réseau ? Tous les équipements associés seront également supprimés.')) {
      try {
        await axios.delete(`http://localhost:5000/api/reseau-equipment-types/${typeId}`);
        fetchEquipmentTypes();
      } catch (err) {
        setError('Erreur lors de la suppression du type d\'équipement réseau');
        console.error(err);
      }
    }
  };

  const handleEdit = (type, event) => {
    event.stopPropagation();
    navigate(`/reseau/types/${type._id}/edit`);
  };

  const handleCardClick = (typeId) => {
    navigate(`/reseau/types/${typeId}`);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Box sx={{ backgroundColor: '#f5f5f5', minHeight: 'calc(100vh - 64px)', py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, maxWidth: 1200, mx: 'auto', position: 'relative' }}>
          {/* Header */}
          <Box display="flex" alignItems="center" gap={2} mb={4}>
            <IconButton
              onClick={() => navigate(-1)}
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
                Types d'équipement réseau
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Gérez les différents types d'équipements réseau de votre infrastructure
              </Typography>
            </Box>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {/* Equipment Types Grid */}
          <Grid container spacing={2} sx={{ display: 'flex', justifyContent: 'flex-start' }}>
            {equipmentTypes.map((type) => (
              <Grid item key={type._id} sx={{ display: 'flex', minWidth: 260, maxWidth: 260, flexBasis: 260 }}>
                <Card
                  onClick={() => handleCardClick(type._id)}
                  sx={{
                    height: 280,
                    width: 280, // Largeur fixe pour toutes les cartes
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    borderRadius: 3,
                    border: '1px solid rgba(0,0,0,0.08)',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 30px rgba(36, 135, 206, 0.15)',
                      borderColor: '#2487CE',
                    }
                  }}
                >
                  <CardContent sx={{ 
                    flexGrow: 1, 
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}>
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
                        mb: 2,
                        mx: 'auto'
                      }}
                    >
                      <RouterIcon sx={{ fontSize: 30, color: '#2487CE' }} />
                    </Box>

                    {/* Type Name - avec hauteur fixe et gestion du débordement */}
                    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Typography 
                        variant="h6" 
                        component="h3"
                        sx={{ 
                          textAlign: 'center',
                          fontWeight: 'bold',
                          color: '#333',
                          width: '100%',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2, // Limite à 2 lignes
                          WebkitBoxOrient: 'vertical',
                          lineHeight: 1.2,
                          height: '2.4em' // Hauteur fixe pour 2 lignes
                        }}
                        title={type.name} // Affiche le nom complet au survol
                      >
                        {type.name}
                      </Typography>
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    {/* Equipment Count */}
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        gap: 1
                      }}
                    >
                      <DevicesIcon sx={{ fontSize: 18, color: '#666' }} />
                      <Chip
                        label={`${equipmentCounts[type._id] || 0} équipement${equipmentCounts[type._id] > 1 ? 's' : ''}`}
                        size="small"
                        sx={{
                          backgroundColor: 'rgba(36, 135, 206, 0.1)',
                          color: '#2487CE',
                          fontWeight: 'medium'
                        }}
                      />
                    </Box>
                  </CardContent>

                  <Divider />

                  <CardActions sx={{ justifyContent: 'center', p: 2, height: 60 }}>
                    {user && user.role === 'admin' && (
                      <>
                        <IconButton
                          onClick={(e) => handleEdit(type, e)}
                          color="primary"
                          title="Modifier"
                          size="small"
                          sx={{
                            backgroundColor: 'rgba(36, 135, 206, 0.1)',
                            mr: 1,
                            '&:hover': {
                              backgroundColor: 'rgba(36, 135, 206, 0.2)',
                            }
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          onClick={(e) => handleDelete(type._id, e)}
                          color="error"
                          title="Supprimer"
                          size="small"
                          sx={{
                            backgroundColor: 'rgba(244, 67, 54, 0.1)',
                            '&:hover': {
                              backgroundColor: 'rgba(244, 67, 54, 0.2)',
                            }
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}

            {/* Empty State */}
            {equipmentTypes.length === 0 && (
              <Grid item xs={12}>
                <Box 
                  sx={{ 
                    textAlign: 'center', 
                    py: 8,
                    color: 'text.secondary'
                  }}
                >
                  <RouterIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
                  <Typography variant="h6" gutterBottom>
                    Aucun type d'équipement réseau trouvé
                  </Typography>
                  <Typography variant="body2">
                    Commencez par ajouter votre premier type d'équipement réseau
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>

          {/* Floating Action Button */}
          {user && user.role === 'admin' && (
            <Fab
              color="primary"
              aria-label="add equipment type"
              onClick={() => navigate('/reseau/types/new')}
              sx={{
                position: 'fixed',
                bottom: 24,
                right: 24,
                backgroundColor: '#2487CE',
                '&:hover': {
                  backgroundColor: '#1a6da8',
                }
              }}
            >
              <AddIcon />
            </Fab>
          )}
        </Paper>
      </Box>
    </>
  );
}

export default ReseauEquipmentTypeList;