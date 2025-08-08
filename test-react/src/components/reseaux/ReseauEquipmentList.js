import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Button,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DeleteIcon from '@mui/icons-material/Delete';
import Navbar from '../reseaux/navbar';

function ReseauEquipmentList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [equipmentCounts, setEquipmentCounts] = useState({});
  const [deleteDialog, setDeleteDialog] = useState({ open: false, typeId: null, typeName: '' });

  const fetchData = async () => {
    try {
      // Charger les types d'équipement réseau
      const typesResponse = await axios.get(`http://localhost:5000/api/reseau-equipment-types`);
      setEquipmentTypes(typesResponse.data);

      // Charger les équipements réseau pour compter par type
      const equipmentsResponse = await axios.get(`http://localhost:5000/api/reseau-equipments`);
      const counts = {};
      equipmentsResponse.data.forEach(equipment => {
        counts[equipment.typeId._id] = (counts[equipment.typeId._id] || 0) + 1;
      });
      setEquipmentCounts(counts);

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
  }, []);

  const handleCardClick = (typeId) => {
    navigate(`/reseau-equipment-types/${typeId}/reseau-equipments`);
  };

  const handleAddClick = () => {
    navigate(`/reseau-equipment-types/add`);
  };

  const handleDeleteClick = (e, typeId, typeName) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteDialog({
      open: true,
      typeId,
      typeName
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      const { typeId } = deleteDialog;
      await axios.delete(`http://localhost:5000/api/reseau-equipment-types/${typeId}`);

      setDeleteDialog({ open: false, typeId: null, typeName: '' });
      setEquipmentTypes(prev => prev.filter(t => t._id !== typeId));
      setSuccess('Type d\'équipement réseau supprimé avec succès');

      await fetchData();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setError(error.response?.data?.error || 'Erreur lors de la suppression');
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Box sx={{ backgroundColor: '#dbeafe', minHeight: '100vh', py: 4, px: 2 }}>
        <Paper elevation={3} sx={{ p: 3, maxWidth: 900, margin: '0 auto' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5">
              Types d'équipement réseau
            </Typography>
            {user && user.role === 'admin' && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddClick}
                sx={{
                  backgroundColor: '#2487CE',
                  '&:hover': {
                    backgroundColor: '#1a6da8',
                  }
                }}
              >
                Nouveau type
              </Button>
            )}
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {equipmentTypes.length === 0 ? (
            <Alert severity="info">
              Aucun type d'équipement réseau disponible.
            </Alert>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3 }}>
              {equipmentTypes.map(type => (
                <Card
                  key={type._id}
                  sx={{
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'scale(1.02)',
                    }
                  }}
                  onClick={() => handleCardClick(type._id)}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {type.name}
                    </Typography>
                    <Typography color="textSecondary">
                      {type.fields.length} champ{type.fields.length > 1 ? 's' : ''}
                    </Typography>
                    <Typography color="textSecondary">
                      {equipmentCounts[type._id] || 0} équipement{(equipmentCounts[type._id] || 0) > 1 ? 's' : ''}
                    </Typography>
                  </CardContent>
                  <Divider />
                  <CardActions sx={{ justifyContent: 'space-between', p: 1 }}>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCardClick(type._id);
                      }}
                      title="Voir les détails"
                    >
                      <ArrowForwardIcon />
                    </IconButton>
                    {user && user.role === 'admin' && (
                      <IconButton
                        size="small"
                        color="error"
                        onClick={(e) => handleDeleteClick(e, type._id, type.name)}
                        title="Supprimer ce type"
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </CardActions>
                </Card>
              ))}
            </Box>
          )}
        </Paper>
      </Box>

      {/* Dialog suppression */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, typeId: null, typeName: '' })}
        PaperProps={{
          sx: { width: '100%', maxWidth: 450 }
        }}
      >
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer le type "{deleteDialog.typeName}" ?<br /><br />
            <strong>Attention :</strong> Cette action supprimera aussi tous les équipements liés et ne peut pas être annulée.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, typeId: null, typeName: '' })} color="primary">
            Annuler
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained" autoFocus>
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar succès */}
      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccess('')} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>

      {/* Snackbar erreur */}
      <Snackbar
        open={!!error}
        autoHideDuration={5000}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </>
  );
}

export default ReseauEquipmentList;
