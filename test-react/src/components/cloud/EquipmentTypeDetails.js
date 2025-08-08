import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  TextField,
  Grid,
  Card,
  CardContent,
  CardActions,
  Tooltip,
  Zoom,
  styled,
  Fab
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import Navbar from '../reseaux/navbar';

// Style personnalisé pour l'icône du serveur
const ServerIcon = styled('div')(({ theme }) => ({
  width: '120px',
  height: '150px',
  margin: '20px auto 30px',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: '0%',
    width: '100%',
    height: '10px',
    backgroundColor: '#1a1a1a',
    borderRadius: '3px',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: '10px',
    left: '10%',
    width: '80%',
    height: '85%',
    backgroundColor: '#2C2C2C',
    borderRadius: '3px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
  },
  '& .top-bar': {
    position: 'absolute',
    top: '8px',
    left: '15%',
    width: '70%',
    height: '4px',
    backgroundColor: '#1a1a1a',
    zIndex: 2,
    '&::before': {
      content: '""',
      position: 'absolute',
      left: '5%',
      top: '0',
      width: '20%',
      height: '4px',
      background: 'linear-gradient(90deg, #ff6b6b, #feca57, #48dbfb)',
    },
  },
  '& .slots': {
    position: 'absolute',
    top: '25%',
    left: '15%',
    width: '70%',
    height: '60%',
    zIndex: 2,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
  },
  '& .slot': {
    width: '100%',
    height: '4px',
    display: 'flex',
    gap: '4px',
    '& .led': {
      width: '8px',
      height: '4px',
      backgroundColor: '#48dbfb',
      borderRadius: '1px',
    },
    '& .space': {
      flex: 1,
    },
  },
}));

// Style personnalisé pour la carte avec effet de survol
const StyledCard = styled(Card)(({ theme, backgroundimage }) => ({
  height: '100%',
  minHeight: '400px',
  width: 220,
  maxWidth: '260px',
  margin: '0 auto',
  cursor: 'pointer',
  transition: 'all 0.3s ease-in-out',
  backgroundColor: '#1a1a1a',
  color: 'white',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: '12px',
  padding: '20px',
  backgroundImage: backgroundimage ? `url(${backgroundimage})` : 'none',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: '12px',
    transition: 'background-color 0.3s ease-in-out',
  },
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
    '&::before': {
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
    },
    '& .hover-content': {
      opacity: 1,
      visibility: 'visible',
    },
    '& .default-content': {
      opacity: 0,
      visibility: 'hidden',
    }
  },
  '& .hover-content': {
    opacity: 0,
    visibility: 'hidden',
    transition: 'opacity 0.3s ease-in-out, visibility 0.3s ease-in-out',
    position: 'absolute',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    padding: '1.5rem',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  '& .default-content': {
    opacity: 1,
    visibility: 'visible',
    transition: 'opacity 0.3s ease-in-out, visibility 0.3s ease-in-out',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '100%',
    textAlign: 'center',
    zIndex: 3,
  },
  '& .card-content': {
    position: 'relative',
    zIndex: 1,
  }
}));

function EquipmentTypeDetails() {
  const { datacenterId, typeId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [type, setType] = useState(null);
  const [equipments, setEquipments] = useState([]);
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [deleteDialog, setDeleteDialog] = useState({ open: false, equipment: null });

  const fetchData = async () => {
    try {
      const [typeResponse, equipmentsResponse] = await Promise.all([
        axios.get(`http://localhost:5000/api/equipment-types/${typeId}`),
        axios.get(`http://localhost:5000/api/equipments/type/${typeId}`)
      ]);

      setType(typeResponse.data);
      setEquipments(equipmentsResponse.data);
      setError('');
    } catch (err) {
      console.error('Erreur lors du chargement:', err);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [typeId]);

  const handleEditClick = (e, equipment) => {
    e.stopPropagation();
    setEditingEquipment(equipment);
    setEditFormData(equipment.data);
  };

  const handleEditChange = (field, value) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEditCancel = (e) => {
    e.stopPropagation();
    setEditingEquipment(null);
    setEditFormData({});
  };

  const handleEditSave = async (e, equipmentId) => {
    e.stopPropagation();
    try {
      await axios.put(`http://localhost:5000/api/equipments/${equipmentId}`, {
        data: editFormData
      });
      
      setSuccess('Équipement modifié avec succès');
      setEditingEquipment(null);
      setEditFormData({});
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la modification');
    }
  };

  const handleDeleteClick = (e, equipment) => {
    e.stopPropagation();
    setDeleteDialog({ open: true, equipment });
  };

  const handleDeleteConfirm = async () => {
    try {
      const { equipment } = deleteDialog;
      await axios.delete(`http://localhost:5000/api/equipments/${equipment._id}`);
      
      setSuccess('Équipement supprimé avec succès');
      setDeleteDialog({ open: false, equipment: null });
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la suppression');
    }
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

  if (!type) {
    return (
      <>
        <Navbar />
        <Box sx={{ p: 3 }}>
          <Alert severity="error">Type d'équipement non trouvé</Alert>
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
              <Typography variant="h4" component="h1" sx={{ 
                color: '#2487CE', 
                fontWeight: 'bold',
                mb: 0.5
              }}>
                Équipements
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {type?.name ? `Type : ${type.name}` : 'Gérez les équipements de ce type'}
              </Typography>
            </Box>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {equipments.length === 0 ? (
            <Box 
              sx={{ 
                textAlign: 'center', 
                py: 8,
                color: 'text.secondary'
              }}
            >
              <Typography variant="h6" gutterBottom>
                Aucun équipement trouvé
              </Typography>
              <Typography variant="body2">
                Commencez par ajouter votre premier équipement
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={2} sx={{ display: 'flex', justifyContent: 'flex-start' }}>
              {equipments.map((equipment) => (
                <Grid item key={equipment._id} sx={{ display: 'flex', minWidth: 260, maxWidth: 260, flexBasis: 260 }}>
                  <StyledCard backgroundimage={type.imageUrl}>
                    <CardContent sx={{ flexGrow: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }} className="card-content">
                      {/* Contenu par défaut - uniquement l'adresse IP */}
                      <Box className="default-content">
                        <ServerIcon>
                          <div className="top-bar" />
                          <div className="slots">
                            <div className="slot">
                              <div className="led" />
                              <div className="space" />
                            </div>
                            <div className="slot">
                              <div className="led" />
                              <div className="space" />
                            </div>
                          </div>
                        </ServerIcon>
                        <Typography variant="h6" component="h2" sx={{ color: 'white', mt: 2 }}>
                          {equipment.data.adresse_ip}
                        </Typography>
                      </Box>

                      {/* Contenu au survol - toutes les infos sauf l'adresse IP */}
                      <Box className="hover-content">
                        <Box sx={{ width: '100%', maxWidth: '350px' }}>
                          {type.fields.map((field) => (
                            field.name !== 'adresse_ip' && (
                              <Box key={field.name} sx={{ mt: 2, mb: 2 }}>
                                <Typography variant="subtitle1" color="grey.300" sx={{ mb: 1 }}>
                                  {field.label}
                                </Typography>
                                <Typography variant="body1" color="white" sx={{ fontWeight: 'medium' }}>
                                  {equipment.data[field.name]}
                                </Typography>
                              </Box>
                            )
                          ))}
                        </Box>
                      </Box>
                    </CardContent>
                    <CardActions sx={{ 
                      justifyContent: 'flex-end', 
                      p: 2,
                      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                      position: 'relative',
                      zIndex: 1
                    }}>
                      {editingEquipment?._id === equipment._id ? (
                        <>
                          <Tooltip title="Enregistrer" arrow>
                            <IconButton
                              size="small"
                              onClick={(e) => handleEditSave(e, equipment._id)}
                              sx={{ color: '#4CAF50' }}
                            >
                              <SaveIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Annuler" arrow>
                            <IconButton
                              size="small"
                              onClick={handleEditCancel}
                              sx={{ color: '#f44336' }}
                            >
                              <CancelIcon />
                            </IconButton>
                          </Tooltip>
                        </>
                      ) : (
                        <>
                          <Tooltip title="Modifier" arrow>
                            <IconButton
                              size="small"
                              onClick={(e) => handleEditClick(e, equipment)}
                              sx={{ color: '#2196f3' }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Supprimer" arrow>
                            <IconButton
                              size="small"
                              onClick={(e) => handleDeleteClick(e, equipment)}
                              sx={{ color: '#f44336' }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </CardActions>
                  </StyledCard>
                </Grid>
              ))}
            </Grid>
          )}

          {/* Floating Action Button */}
          <Fab
            color="primary"
            aria-label="add equipment"
            onClick={() => navigate(`/datacenters/${datacenterId}/equipments/add/${typeId}`)}
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
        </Paper>
      </Box>

      {/* Dialog de confirmation de suppression */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, equipment: null })}
        PaperProps={{
          sx: {
            borderRadius: 3
          }
        }}
      >
        <DialogTitle sx={{ 
          fontSize: '1.25rem',
          fontWeight: 'bold',
          color: '#2487CE'
        }}>
          Confirmer la suppression
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer cet équipement ? Cette action ne peut pas être annulée.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={() => setDeleteDialog({ open: false, equipment: null })}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            variant="contained"
            color="error"
            sx={{ borderRadius: 2, px: 3 }}
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar pour les messages */}
      <Snackbar
        open={!!success || !!error}
        autoHideDuration={3000}
        onClose={() => {
          setSuccess('');
          setError('');
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => {
            setSuccess('');
            setError('');
          }} 
          severity={success ? "success" : "error"}
          sx={{ width: '100%' }}
        >
          {success || error}
        </Alert>
      </Snackbar>
    </>
  );
}

export default EquipmentTypeDetails;