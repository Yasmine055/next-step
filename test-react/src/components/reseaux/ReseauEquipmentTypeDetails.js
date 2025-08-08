import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
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
  Grid,
  Card,
  CardContent,
  CardActions,
  Tooltip,
  styled,
  Fab
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import RefreshIcon from '@mui/icons-material/Refresh';
import RouterIcon from '@mui/icons-material/Router';
import Navbar from '../reseaux/navbar';

// Style personnalisé pour l'icône réseau (GARDÉ TEL QUEL)
const NetworkIcon = styled('div')(({ theme }) => ({
  width: '120px',
  height: '150px',
  margin: '20px auto 30px',
  position: 'relative',
  '&::before': { // Base du routeur
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: '0%',
    width: '100%',
    height: '10px',
    backgroundColor: '#1a1a1a',
    borderRadius: '3px',
  },
  '&::after': { // Corps principal du routeur
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
  '& .antenna': {
    position: 'absolute',
    top: '5px',
    left: '20%',
    width: '2px',
    height: '25px',
    backgroundColor: '#666',
    zIndex: 2,
    '&::before': { // Antenne 2
      content: '""',
      position: 'absolute',
      left: '30px',
      top: '0',
      width: '2px',
      height: '25px',
      backgroundColor: '#666',
    },
    '&::after': { // Antenne 3
      content: '""',
      position: 'absolute',
      left: '60px',
      top: '0',
      width: '2px',
      height: '25px',
      backgroundColor: '#666',
    }
  },
  '& .ports': {
    position: 'absolute',
    bottom: '15px',
    left: '20%',
    width: '60%',
    height: '20%',
    zIndex: 2,
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  '& .port': {
    width: '8px',
    height: '6px',
    backgroundColor: '#48dbfb',
    borderRadius: '1px',
  },
  '& .led-strip': {
    position: 'absolute',
    top: '40%',
    left: '20%',
    width: '60%',
    height: '4px',
    display: 'flex',
    gap: '3px',
    zIndex: 2,
    '& .led': {
      width: '6px',
      height: '4px',
      backgroundColor: '#4caf50',
      borderRadius: '1px',
    },
  },
}));

// Style personnalisé pour la carte avec effet de survol (GARDÉ TEL QUEL)
const StyledCard = styled(Card)(({ theme, backgroundimage }) => ({
  height: '100%',
  minHeight: '400px',
  width: '200',
  maxWidth: '350px',
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

function ReseauEquipmentTypeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [type, setType] = useState(null);
  const [equipments, setEquipments] = useState([]);
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [deleteDialog, setDeleteDialog] = useState({ open: false, equipment: null });

  // ✅ FONCTION UTILITAIRE pour extraire les customFields
  const extractCustomFields = (equipment) => {
    if (!equipment.customFields) return {};
    
    // Les Maps Mongoose peuvent être sérialisées de différentes façons
    if (equipment.customFields instanceof Map) {
      return Object.fromEntries(equipment.customFields);
    } else if (typeof equipment.customFields === 'object') {
      return equipment.customFields;
    }
    
    return {};
  };

  // Fonction pour récupérer les équipements
  const fetchEquipments = async () => {
    console.log('🔄 Récupération des équipements pour typeId:', id);
    
    try {
      const response = await axios.get(`http://localhost:5000/api/reseau-equipments`);
      const allEquipments = response.data;
      
      console.log('📦 Tous les équipements récupérés:', allEquipments);
      
      if (!Array.isArray(allEquipments)) {
        console.error('❌ Réponse non valide, pas un tableau:', allEquipments);
        return [];
      }
      
      // ✅ DEBUG pour voir la structure des customFields
      if (allEquipments.length > 0) {
        console.log('🔍 Premier équipement complet:', allEquipments[0]);
        console.log('🔍 CustomFields brut:', allEquipments[0].customFields);
        console.log('🔍 CustomFields extrait:', extractCustomFields(allEquipments[0]));
      }
      
      // Filtrer les équipements par typeId
      const filteredEquipments = allEquipments.filter(equipment => {
        const isMatch = equipment.typeId === id || 
                       equipment.typeId === id.toString() ||
                       (equipment.typeId && equipment.typeId._id === id) ||
                       (equipment.typeId && equipment.typeId._id === id.toString()) ||
                       (equipment.typeId && equipment.typeId.toString() === id);
        
        return isMatch;
      });
      
      console.log('🎯 Équipements filtrés:', filteredEquipments);
      return filteredEquipments;
      
    } catch (err) {
      console.error('❌ Erreur lors de la récupération des équipements:', err);
      return [];
    }
  };

  const fetchData = async () => {
    try {
      console.log('🔄 Début fetchData pour ID:', id);
      setLoading(true);
      setError('');
      
      // Récupérer le type d'équipement réseau et les équipements en parallèle
      const [typeResponse, equipmentsData] = await Promise.all([
        axios.get(`http://localhost:5000/api/reseau-equipment-types/${id}`),
        fetchEquipments()
      ]);

      console.log('✅ Type récupéré:', typeResponse.data);
      console.log('✅ Équipements récupérés:', equipmentsData);
      setType(typeResponse.data);
      setEquipments(equipmentsData);
      setError('');

    } catch (err) {
      console.error('💥 Erreur lors du chargement:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors du chargement des données';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id, location.search]);

  // ✅ FONCTION CORRIGÉE pour obtenir l'adresse IP (champ principal à afficher)
  const getIPAddress = (equipment) => {
    if (!type?.fields || type.fields.length === 0) return 'Équipement réseau';
    
    // ✅ Utiliser la fonction extractCustomFields
    const equipmentData = extractCustomFields(equipment);
    
    console.log('📊 Données extraites pour IP:', equipmentData);
    
    // Chercher spécifiquement un champ adresse IP
    const ipField = type.fields.find(f => 
      f.name.toLowerCase().includes('ip') ||
      f.name.toLowerCase().includes('adresse') ||
      f.name.toLowerCase().includes('address')
    );
    
    if (ipField && equipmentData[ipField.name]) {
      console.log('✅ IP trouvée:', equipmentData[ipField.name]);
      return equipmentData[ipField.name];
    }
    
    // Sinon prendre le premier champ disponible
    const firstField = type.fields[0];
    const firstValue = equipmentData[firstField.name];
    
    if (firstValue) {
      console.log('✅ Première valeur trouvée:', firstValue);
      return firstValue;
    }
    
    console.log('❌ Aucune valeur trouvée, utilisation de fallback');
    const shortId = equipment._id?.slice(-6) || 'XXX';
    
    // Si c'est un champ IP, suggérer le format IP
    if (ipField) {
      return `IP-${shortId}`;
    }
    
    // Sinon utiliser le nom du premier champ
    return `${firstField.label || firstField.name}-${shortId}`;
  };

  // ✅ FONCTION CORRIGÉE pour obtenir la valeur d'un champ
  const getFieldValue = (equipment, fieldName) => {
    console.log('🔍 getFieldValue appelé pour:', fieldName, 'équipement:', equipment);
    
    // ✅ Utiliser la fonction extractCustomFields
    const equipmentData = extractCustomFields(equipment);
    const value = equipmentData[fieldName];
    
    console.log('🎯 Valeur finale pour', fieldName, ':', value);
    
    // Si pas de valeur, retourner un placeholder informatif
    if (!value) {
      return `Non configuré`;
    }
    
    return value;
  };

  const handleEditClick = (e, equipment) => {
    e.stopPropagation();
    setEditingEquipment(equipment);
    
    // ✅ CORRECTION : Utiliser extractCustomFields
    const equipmentData = extractCustomFields(equipment);
    
    // S'assurer qu'on a au moins une structure vide pour tous les champs
    const editData = {};
    if (type?.fields) {
      type.fields.forEach(field => {
        editData[field.name] = equipmentData[field.name] || '';
      });
    }
    
    console.log('🎛 Données d\'édition:', editData);
    setEditFormData(editData);
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
      console.log('💾 Sauvegarde des données:', editFormData);
      
      // ✅ CORRECTION : Sauvegarder dans customFields
      await axios.put(`http://localhost:5000/api/reseau-equipments/${equipmentId}`, {
        customFields: editFormData  // ← CHANGEMENT ICI
      });
      
      setSuccess('Équipement modifié avec succès');
      setEditingEquipment(null);
      setEditFormData({});
      await fetchData();
    } catch (err) {
      console.error('💥 Erreur modification:', err);
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
      await axios.delete(`http://localhost:5000/api/reseau-equipments/${equipment._id}`);
      
      setSuccess('Équipement supprimé avec succès');
      setDeleteDialog({ open: false, equipment: null });
      await fetchData();
    } catch (err) {
      console.error('💥 Erreur suppression:', err);
      setError(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const handleRefresh = () => {
    console.log('🔄 Refresh manuel déclenché');
    fetchData();
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
          <Alert severity="error">Type d'équipement réseau non trouvé</Alert>
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
                {type.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Liste des équipements réseau de ce type
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
              <RouterIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
              <Typography variant="h6" gutterBottom>
                Aucun équipement trouvé
              </Typography>
              <Typography variant="body2">
                Commencez par ajouter votre premier équipement pour ce type
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={4}>
              {equipments.map((equipment) => (
                <Grid item xs={12} sm={6} md={4} key={equipment._id}>
                  <StyledCard backgroundimage={type.imageUrl}>
                    <CardContent sx={{ 
                      flexGrow: 1, 
                      textAlign: 'center', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      justifyContent: 'center' 
                    }} className="card-content">
                      
                      {/* Contenu par défaut - champ principal uniquement */}
                      <Box className="default-content">
                        <NetworkIcon>
                          <div className="antenna" />
                          <div className="led-strip">
                            <div className="led" />
                            <div className="led" />
                            <div className="led" />
                          </div>
                          <div className="ports">
                            <div className="port" />
                            <div className="port" />
                            <div className="port" />
                            <div className="port" />
                          </div>
                        </NetworkIcon>
                        <Typography variant="h6" component="h2" sx={{ color: 'white', mt: 2 }}>
                          {getIPAddress(equipment)}
                        </Typography>
                      </Box>

                      {/* Contenu au survol - tous les autres champs sauf l'adresse IP */}
                      <Box className="hover-content">
                        <Box sx={{ width: '100%', maxWidth: '350px' }}>
                          {type.fields && type.fields.map((field) => {
                            // Identifier le champ adresse IP
                            const ipField = type.fields.find(f => 
                              f.name.toLowerCase().includes('ip') ||
                              f.name.toLowerCase().includes('adresse') ||
                              f.name.toLowerCase().includes('address')
                            );
                            
                            const ipFieldName = ipField?.name || type.fields[0]?.name;
                            
                            // N'afficher que les champs autres que l'adresse IP
                            return field.name !== ipFieldName && (
                              <Box key={field.name} sx={{ mt: 2, mb: 2 }}>
                                <Typography variant="subtitle1" color="grey.300" sx={{ mb: 1 }}>
                                  {field.label}
                                </Typography>
                                {editingEquipment?._id === equipment._id ? (
                                  <input
                                    type={field.type || 'text'}
                                    value={editFormData[field.name] || ''}
                                    onChange={(e) => handleEditChange(field.name, e.target.value)}
                                    style={{
                                      width: '100%',
                                      padding: '8px 12px',
                                      backgroundColor: '#333',
                                      color: 'white',
                                      border: '1px solid #555',
                                      borderRadius: '6px',
                                      fontSize: '14px',
                                      fontFamily: 'inherit'
                                    }}
                                    placeholder={`Entrez ${field.label.toLowerCase()}`}
                                  />
                                ) : (
                                  <Typography variant="body1" color="white" sx={{ fontWeight: 'medium' }}>
                                    {getFieldValue(equipment, field.name)}
                                  </Typography>
                                )}
                              </Box>
                            );
                          })}
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
            onClick={() => navigate(`/reseau/equipements/new/${id}`)}
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
          Confirmer la suppression
        </DialogTitle>
        <DialogContent sx={{ pb: 2 }}>
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

export default ReseauEquipmentTypeDetails;