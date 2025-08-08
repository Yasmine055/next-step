const express = require('express');
const router = express.Router();
const authController = require('../../controllers/user/authController');

// Authentication routes
router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/logout', authController.logout);
router.get('/profile', authController.authenticate, authController.getProfile);
router.put('/profile', authController.authenticate, authController.updateProfile);

// Route pour récupérer l'utilisateur connecté (requise par useAuth)
router.get('/me', authController.authenticate, authController.getProfile);

// Protected routes
router.get('/admin-only', authController.authenticate, authController.requireAdmin, (req, res) => {
    res.json({ message: 'Zone admin' });
});
router.get('/protected', authController.authenticate, (req, res) => {
    res.json({ user: req.user });
});

module.exports = router;