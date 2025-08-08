import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
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
import FolderIcon from '@mui/icons-material/Folder';
import DevicesIcon from '@mui/icons-material/Devices';
import Navbar from '../reseaux/navbar';

function CategoryList() {
  const { user } = useAuth();
  const { datacenterId } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [equipmentTypeCounts, setEquipmentTypeCounts] = useState({});

  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/categories/datacenter/${datacenterId}`);
      setCategories(response.data);
      
      // Récupérer le nombre de types d'équipement pour chaque catégorie
      const counts = {};
      for (const category of response.data) {
        try {
          const typesResponse = await axios.get(`http://localhost:5000/api/equipment-types/category/${category._id}`);
          counts[category._id] = typesResponse.data.length;
        } catch (err) {
          console.error('Erreur lors du comptage des types:', err);
          counts[category._id] = 0;
        }
      }
      setEquipmentTypeCounts(counts);
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement des catégories');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [datacenterId]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleOpenDialog = (category = null) => {
    setEditingCategory(category);
    setCategoryName(category ? category.name : '');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCategory(null);
    setCategoryName('');
  };

  const handleSubmit = async () => {
    try {
      if (editingCategory) {
        await axios.put(`http://localhost:5000/api/categories/${editingCategory._id}`, {
          name: categoryName
        });
      } else {
        await axios.post('http://localhost:5000/api/categories', {
          name: categoryName,
          datacenterId
        });
      }
      handleCloseDialog();
      fetchCategories();
    } catch (err) {
      setError('Erreur lors de l\'enregistrement de la catégorie');
      console.error(err);
    }
  };

  const handleDelete = async (categoryId, event) => {
    event.stopPropagation();
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ? Tous les types d\'équipement associés seront également supprimés.')) {
      try {
        await axios.delete(`http://localhost:5000/api/categories/${categoryId}`);
        fetchCategories();
      } catch (err) {
        setError('Erreur lors de la suppression de la catégorie');
        console.error(err);
      }
    }
  };

  const handleEdit = (category, event) => {
    event.stopPropagation();
    handleOpenDialog(category);
  };

  const handleCardClick = (categoryId) => {
    navigate(`/datacenters/${datacenterId}/categories/${categoryId}/equipment-types`);
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
              onClick={() => navigate(`/datacenters`)}
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
                Catégories d'équipements
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Gérez les différentes catégories d'équipements de votre datacenter
              </Typography>
            </Box>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {/* Categories Grid */}
          <Grid container spacing={2} sx={{ display: 'flex', justifyContent: 'flex-start' }}>
            {categories.map((category) => (
              <Grid item key={category._id} sx={{ display: 'flex', minWidth: 260, maxWidth: 260, flexBasis: 260 }}>
                <Card
                  onClick={() => handleCardClick(category._id)}
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
                      <FolderIcon sx={{ fontSize: 30, color: '#2487CE' }} />
                    </Box>

                    {/* Category Name - avec hauteur fixe et gestion du débordement */}
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
                        title={category.name} // Affiche le nom complet au survol
                      >
                        {category.name}
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
                        label={`${equipmentTypeCounts[category._id] || 0} type${equipmentTypeCounts[category._id] > 1 ? 's' : ''}`}
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
                          onClick={(e) => handleEdit(category, e)}
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
                          onClick={(e) => handleDelete(category._id, e)}
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
            {categories.length === 0 && (
              <Grid item xs={12}>
                <Box 
                  sx={{ 
                    textAlign: 'center', 
                    py: 8,
                    color: 'text.secondary'
                  }}
                >
                  <FolderIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
                  <Typography variant="h6" gutterBottom>
                    Aucune catégorie trouvée
                  </Typography>
                  <Typography variant="body2">
                    Commencez par ajouter votre première catégorie d'équipements
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>

          {/* Floating Action Button */}
          {user && user.role === 'admin' && (
            <Fab
              color="primary"
              aria-label="add category"
              onClick={() => handleOpenDialog()}
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

          {/* Dialog */}
          <Dialog 
            open={openDialog} 
            onClose={handleCloseDialog}
            PaperProps={{
              sx: {
                borderRadius: 3,
                minWidth: 400
              }
            }}
          >
            <DialogTitle sx={{ 
              pb: 1,
              fontSize: '1.25rem',
              fontWeight: 'bold',
              color: '#2487CE'
            }}>
              {editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
            </DialogTitle>
            <DialogContent sx={{ pb: 2 }}>
              <TextField
                autoFocus
                margin="dense"
                label="Nom de la catégorie"
                type="text"
                fullWidth
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                variant="outlined"
                sx={{ mt: 2 }}
              />
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 1 }}>
              <Button 
                onClick={handleCloseDialog}
                variant="outlined"
                sx={{ borderRadius: 2 }}
              >
                Annuler
              </Button>
              <Button 
                onClick={handleSubmit} 
                variant="contained" 
                sx={{
                  backgroundColor: '#2487CE',
                  borderRadius: 2,
                  px: 3,
                  '&:hover': {
                    backgroundColor: '#1a6da8',
                  }
                }}
              >
                {editingCategory ? 'Modifier' : 'Ajouter'}
              </Button>
            </DialogActions>
          </Dialog>
        </Paper>
      </Box>
    </>
  );
}

export default CategoryList;