import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Grid,
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
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import Navbar from '../reseaux/navbar';

function EquipmentList() {
  const { user } = useAuth();
  const { id: datacenterId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [datacenter, setDatacenter] = useState(null);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [equipmentCounts, setEquipmentCounts] = useState({});
  const [deleteDialog, setDeleteDialog] = useState({ open: false, typeId: null, typeName: '' });

  const fetchData = async () => {
    try {
      // Charger les informations du datacenter
      const datacenterResponse = await axios.get(`http://localhost:5000/api/datacenters/${datacenterId}`);
      setDatacenter(datacenterResponse.data);

      // Charger les types d'équipement
      const typesResponse = await axios.get(`http://localhost:5000/api/equipment-types/datacenter/${datacenterId}`);
      setEquipmentTypes(typesResponse.data);

      // Charger les équipements pour compter par type
      const equipmentsResponse = await axios.get(`http://localhost:5000/api/equipments/datacenter/${datacenterId}`);
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
  }, [datacenterId]);

  const handleCardClick = (typeId) => {
    navigate(`/datacenters/${datacenterId}/equipment-types/${typeId}/equipments`);
  };

  const handleAddClick = (e, typeId) => {
    e.stopPropagation();
    navigate(`/datacenters/${datacenterId}/equipments/add/${typeId}`);
  };

  const handleDeleteClick = (e, typeId, typeName) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Tentative de suppression du type:', { typeId, typeName });
    setDeleteDialog({
      open: true,
      typeId,
      typeName
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      const { typeId, typeName } = deleteDialog;
      console.log('Suppression du type:', { typeId, typeName });

      const response = await axios.delete(`http://localhost:5000/api/equipment-types/${typeId}`);
      console.log('Réponse de suppression:', response.data);

      // Fermer le dialog avant de mettre à jour la liste
      setDeleteDialog({ open: false, typeId: null, typeName: '' });
      
      // Mettre à jour la liste localement
      setEquipmentTypes(prevTypes => prevTypes.filter(t => t._id !== typeId));
      
      // Afficher le message de succès
      setSuccess('Type d\'équipement supprimé avec succès');

      // Recharger les données
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
        <Paper elevation={3} sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Box display="flex" alignItems="center" gap={2}>
              <IconButton
                onClick={() => navigate('/datacenters')}
                color="primary"
              >
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="h5">
                Types d'équipement - {datacenter?.nom}
              </Typography>
            </Box>
            {user && user.role === 'admin' && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate(`/datacenters/${datacenterId}/equipment-types`)}
                sx={{
                  backgroundColor: '#2487CE',
                  '&:hover': {
                    backgroundColor: '#1a6da8',
                  }
                }}
              >
                Nouveau type d'équipement
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
              Aucun type d'équipement n'a été créé pour ce datacenter.
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
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={(e) => handleAddClick(e, type._id)}
                          title="Ajouter un équipement"
                        >
                          <AddIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={(e) => handleDeleteClick(e, type._id, type.name)}
                          title="Supprimer ce type"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    )}
                  </CardActions>
                </Card>
              ))}
            </Box>
          )}
        </Paper>
      </Box>

      {/* Dialog de confirmation de suppression */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, typeId: null, typeName: '' })}
        PaperProps={{
          sx: {
            width: '100%',
            maxWidth: 500
          }
        }}
      >
        <DialogTitle>
          Confirmer la suppression
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer le type d'équipement "{deleteDialog.typeName}" ?
            <br /><br />
            <strong>Attention :</strong> Cette action supprimera également tous les équipements associés à ce type et ne peut pas être annulée.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialog({ open: false, typeId: null, typeName: '' })}
            color="primary"
          >
            Annuler
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            autoFocus
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar pour les messages de succès */}
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

      {/* Snackbar pour les messages d'erreur */}
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

export default EquipmentList; 