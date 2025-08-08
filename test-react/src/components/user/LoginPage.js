import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Link,
  Divider
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
  PersonAdd as PersonAddIcon
} from '@mui/icons-material';
import logo from '../../assets/images/LOGO.png';

function LoginPage() {
  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  // Rediriger si déjà connecté
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/profile');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError(''); // Effacer l'erreur quand l'utilisateur tape
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validation côté client
      if (!form.email || !form.password) {
        throw new Error('Veuillez remplir tous les champs');
      }

      const result = await login(form.email, form.password);
      
      if (result.success) {
        // Rediriger selon le rôle
        if (result.data.user.role === 'admin') {
          navigate('/users');
        } else {
          navigate('/reseau/types');
        }
      } else {
        setError(result.message);
      }
      
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box 
      sx={{ 
        backgroundColor: '#f5f5f5', 
        
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        py: 4,
        px: 2
      }}
    >
      <Paper 
        elevation={6} 
        sx={{ 
          p: 4, 
          maxWidth: 450, 
          width: '100%',
          borderRadius: 3,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
        }}
      >
        {/* Header avec Logo */}
        <Box textAlign="center" mb={4}>

          {/* Logo au dessus de "Connexion" */}
          <Box 
            sx={{
              width: 80,
              height: 80,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2
            }}
          >
            <img 
              src={logo} 
              alt="Logo" 
              style={{ 
                height: '80px', 
                width: '80px',
                objectFit: 'contain'
              }} 
            />
          </Box>
          <Typography 
            variant="h4" 
            sx={{ 
              color: '#00a7e5', 
              fontWeight: 'bold',
              mb: 1
            }}
          >
            Connexion
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Connectez-vous à votre compte
          </Typography>
        </Box>

        {/* Alerte d'erreur */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: 2
            }}
          >
            {error}
          </Alert>
        )}

        {/* Formulaire */}
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Adresse email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            disabled={loading}
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon sx={{ color: '#00a7e5' }} />
                </InputAdornment>
              ),
            }}
            variant="outlined"
          />

          <TextField
            fullWidth
            label="Mot de passe"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={form.password}
            onChange={handleChange}
            required
            disabled={loading}
            sx={{ mb: 4 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon sx={{ color: '#00a7e5' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={togglePasswordVisibility}
                    edge="end"
                    disabled={loading}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            variant="outlined"
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading || !form.email || !form.password}
            sx={{
              backgroundColor: '#2487CE',
              py: 1.5,
              borderRadius: 2,
              fontSize: '1.1rem',
              fontWeight: 'bold',
              textTransform: 'none',
              boxShadow: '0 4px 15px rgba(36, 135, 206, 0.3)',
              '&:hover': {
                backgroundColor: '#1976d2',
                boxShadow: '0 6px 20px rgba(36, 135, 206, 0.4)',
              },
              '&:disabled': {
                backgroundColor: '#cccccc',
              }
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: 'white' }} />
            ) : (
              'Se connecter'
            )}
          </Button>
        </Box>

        
      </Paper>
    </Box>
  );
}

export default LoginPage;