import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress
} from '@mui/material';
import Navbar from '../reseaux/navbar';

function DatacenterEdit() {
  const [nom, setNom] = useState('');
  const [emplacement, setEmplacement] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDatacenter = async () => {
      try {
        console.log('Chargement du datacenter avec ID:', id);
        const response = await axios.get(`http://localhost:5000/api/datacenters/${id}`);
        console.log('Données reçues:', response.data);
        setNom(response.data.nom);
        setEmplacement(response.data.emplacement);
        setError('');
      } catch (err) {
        console.error('Erreur lors du chargement:', err);
        setError('Erreur lors du chargement du datacenter: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };

    fetchDatacenter();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      console.log('Envoi des données de modification:', { nom, emplacement });
      const response = await axios.put(`http://localhost:5000/api/datacenters/${id}`, { 
        nom, 
        emplacement 
      });
      console.log('Réponse de modification:', response.data);
      navigate('/datacenters');
    } catch (err) {
      console.error('Erreur lors de la modification:', err);
      setError('Erreur lors de la modification du datacenter: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
          <CircularProgress />
        </Box>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Box
        sx={{
          backgroundColor: '#dbeafe',
          minHeight: '100vh',
          py: 4,
          px: 2
        }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            maxWidth: 600, 
            margin: '0 auto',
            backgroundColor: 'white' 
          }}
        >
          <Typography variant="h5" gutterBottom>
            Modifier le Datacenter
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Nom"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              margin="normal"
              required
              error={!nom}
              helperText={!nom ? "Le nom est requis" : ""}
            />
            <TextField
              fullWidth
              label="Emplacement"
              value={emplacement}
              onChange={(e) => setEmplacement(e.target.value)}
              margin="normal"
              required
              error={!emplacement}
              helperText={!emplacement ? "L'emplacement est requis" : ""}
            />
            <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/datacenters')}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={!nom || !emplacement}
              >
                Enregistrer
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </>
  );
}

export default DatacenterEdit;
