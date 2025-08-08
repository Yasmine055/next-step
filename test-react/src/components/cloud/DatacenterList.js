import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Button,
  Paper,
  Typography,
  Alert,
  CircularProgress,
  Snackbar,
  IconButton,
  Card,
  CardContent,
  CardActions,
  CardMedia,
  Grid,
  Divider,
  Fab
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import BusinessIcon from '@mui/icons-material/Business';
import Navbar from '../reseaux/navbar';
import datacenterImage from '../../assets/images/datacenter.png';

function DatacenterList() {
  const { user } = useAuth();
  const [datacenters, setDatacenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const fetchDatacenters = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/datacenters');
      setDatacenters(response.data);
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement des datacenters');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatacenters();
  }, []);

  const handleDelete = async (id, event) => {
    event.stopPropagation();

    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce datacenter ?')) {
      try {
        await axios.delete(`http://localhost:5000/api/datacenters/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        setSuccess('Datacenter supprimé avec succès');
        await fetchDatacenters();
      } catch (err) {
        setError(err.response?.data?.message || 'Erreur lors de la suppression du datacenter');
      }
    }
  };

  const handleEdit = (id, event) => {
    event.stopPropagation();
    navigate(`/datacenters/modifier/${id}`);
  };

  const handleAddDatacenter = () => {
    navigate('/datacenters/ajouter');
  };

  const handleViewCategories = (datacenterId) => {
    navigate(`/datacenters/${datacenterId}/categories`);
  };

  const handleCardClick = (datacenterId) => {
    handleViewCategories(datacenterId);
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
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ color: '#2487CE', fontWeight: 'bold', mb: 0.5 }}>
              Liste des Datacenters
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Gérez vos datacenters et accédez à leurs catégories d'équipements.
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={3}>
            {datacenters.map(dc => (
              <Grid item xs={12} sm={6} md={4} key={dc._id}>
                <Card 
                  onClick={() => handleCardClick(dc._id)}
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    borderRadius: 3,
                    border: '1px solid rgba(0,0,0,0.08)',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 30px rgba(36, 135, 206, 0.15)',
                      borderColor: '#2487CE',
                    }
                  }}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={datacenterImage}
                    alt="Datacenter"
                    sx={{
                      objectFit: 'cover',
                      borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
                    }}
                  />
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#333', mb: 1 }}>
                      {dc.nom}
                    </Typography>
                    <Typography color="textSecondary" variant="body2" sx={{ mb: 1 }}>
                      📍 {dc.emplacement}
                    </Typography>
                  </CardContent>

                  <Divider />

                  <CardActions sx={{ justifyContent: 'flex-end', p: 2, height: 60 }}>
                    {user && user.role === 'admin' && (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          onClick={(e) => handleEdit(dc._id, e)}
                          color="primary"
                          title="Modifier"
                          size="small"
                          sx={{
                            backgroundColor: 'rgba(36, 135, 206, 0.1)',
                            '&:hover': {
                              backgroundColor: 'rgba(36, 135, 206, 0.2)',
                            }
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          onClick={(e) => handleDelete(dc._id, e)}
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
                      </Box>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}

            {datacenters.length === 0 && (
              <Grid item xs={12}>
                <Box textAlign="center" py={8} color="text.secondary">
                  <BusinessIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
                  <Typography variant="h6" gutterBottom>
                    Aucun datacenter trouvé
                  </Typography>
                  <Typography variant="body2">
                    Commencez par ajouter un datacenter.
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>

          {user && user.role === 'admin' && (
            <Fab
              color="primary"
              aria-label="add datacenter"
              onClick={handleAddDatacenter}
              sx={{
                position: 'fixed',
                bottom: 24,
                right: 24,
                backgroundColor: '#2487CE',
                '&:hover': {
                  backgroundColor: '#1a6da8',
                },
                boxShadow: '0 4px 12px rgba(36, 135, 206, 0.4)',
              }}
            >
              <AddIcon />
            </Fab>
          )}
        </Paper>
      </Box>

      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess('')}
      >
        <Alert severity="success" onClose={() => setSuccess('')}>
          {success}
        </Alert>
      </Snackbar>
    </>
  );
}

export default DatacenterList;