import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import SettingsIcon from '@mui/icons-material/Settings';
import ComputerIcon from '@mui/icons-material/Computer';
import Navbar from '../reseaux/navbar';

function EquipmentTypeList() {
  const { user } = useAuth();
  const { datacenterId, categoryId } = useParams();
  const navigate = useNavigate();
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [equipmentCounts, setEquipmentCounts] = useState({});

  const fetchData = useCallback(async () => {
    try {
      const [categoryResponse, typesResponse] = await Promise.all([
        axios.get(`http://localhost:5000/api/categories/${categoryId}`),
        axios.get(`http://localhost:5000/api/equipment-types/category/${categoryId}`)
      ]);
      setCategory(categoryResponse.data);
      setEquipmentTypes(typesResponse.data);

      const counts = {};
      for (const type of typesResponse.data) {
        try {
          const equipmentResponse = await axios.get(`http://localhost:5000/api/equipments/type/${type._id}`);
          counts[type._id] = equipmentResponse.data.length;
        } catch (err) {
          console.error('Erreur lors du comptage des équipements:', err);
          counts[type._id] = 0;
        }
      }
      setEquipmentCounts(counts);
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement des données');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (typeId, event) => {
    event.stopPropagation();
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce type d'équipement ?")) {
      try {
        await axios.delete(`http://localhost:5000/api/equipment-types/${typeId}`);
        fetchData();
      } catch (err) {
        setError("Erreur lors de la suppression du type d'équipement");
        console.error(err);
      }
    }
  };

  const handleCardClick = (typeId) => {
    navigate(`/datacenters/${datacenterId}/equipment-types/${typeId}/equipments`);
  };

  const handleEdit = (type, event) => {
    event.stopPropagation();
    navigate(`/datacenters/${datacenterId}/categories/${categoryId}/equipment-types/${type._id}/edit`);
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
          <Box display="flex" alignItems="center" gap={2} mb={4}>
            <IconButton
              onClick={() => navigate(`/datacenters/${datacenterId}/categories`)}
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
              <Typography variant="h4" sx={{ color: '#2487CE', fontWeight: 'bold', mb: 0.5 }}>
                Types d'équipement
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {category?.name ? `Catégorie : ${category.name}` : "Gérez les types d'équipement"}
              </Typography>
            </Box>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2}>
            {equipmentTypes.map((type) => (
              <Grid item key={type._id} sx={{ display: 'flex', minWidth: 260, maxWidth: 260, flexBasis: 260 }}>
                <Card
                  onClick={() => handleCardClick(type._id)}
                  sx={{
                    height: 280,
                    width: 260,
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
                  <CardContent sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 60,
                      height: 60,
                      backgroundColor: 'rgba(36, 135, 206, 0.1)',
                      borderRadius: '50%',
                      mb: 2,
                      mx: 'auto'
                    }}>
                      <SettingsIcon sx={{ fontSize: 30, color: '#2487CE' }} />
                    </Box>
                    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" sx={{
                        textAlign: 'center',
                        fontWeight: 'bold',
                        color: '#333',
                        width: '100%',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        lineHeight: 1.2,
                        height: '2.4em'
                      }} title={type.name}>
                        {type.name}
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                      <ComputerIcon sx={{ fontSize: 18, color: '#666' }} />
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

            {equipmentTypes.length === 0 && (
              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
                  <SettingsIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
                  <Typography variant="h6" gutterBottom>
                    Aucun type d'équipement trouvé
                  </Typography>
                  <Typography variant="body2">
                    Commencez par ajouter votre premier type d'équipement
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
              onClick={() =>
                navigate(`/datacenters/${datacenterId}/categories/${categoryId}/equipment-types/new`)
              }
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

export default EquipmentTypeList;
