const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Générer un token JWT
const generateToken = (userId) => {
  return jwt.sign(
    { userId }, 
    process.env.JWT_SECRET || 'votre_secret_jwt_tres_securise', 
    { expiresIn: '7d' }
  );
};

// Connexion utilisateur
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation des champs
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Veuillez fournir un email et un mot de passe' 
      });
    }

    // Rechercher l'utilisateur par email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ 
        message: 'Email ou mot de passe incorrect' 
      });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        message: 'Email ou mot de passe incorrect' 
      });
    }

    // Générer le token
    const token = generateToken(user._id);

    // Retourner les informations de connexion
    res.json({
      message: 'Connexion réussie',
      token,
      user: {
        id: user._id,
        prenom: user.prenom,
        nom: user.nom,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Erreur de connexion:', error);
    res.status(500).json({ 
      message: 'Erreur interne du serveur' 
    });
  }
};

// Inscription utilisateur
exports.register = async (req, res) => {
  try {
    const { prenom, nom, email, phone, password, role } = req.body;

    // Validation des champs requis
    if (!prenom || !nom || !email || !phone || !password) {
      return res.status(400).json({ 
        message: 'Tous les champs sont requis' 
      });
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ 
        message: 'Un utilisateur avec cet email existe déjà' 
      });
    }

    // Créer le nouvel utilisateur
    const user = new User({
      prenom,
      nom,
      email: email.toLowerCase(),
      phone,
      password,
      role: role || 'user'
    });

    await user.save();

    // Générer le token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Inscription réussie',
      token,
      user: {
        id: user._id,
        prenom: user.prenom,
        nom: user.nom,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Erreur d\'inscription:', error);
    
    // Gestion des erreurs de duplication
    if (error.code === 11000) {
      if (error.keyPattern.email) {
        return res.status(400).json({ 
          message: 'Cette adresse email est déjà utilisée' 
        });
      }
      if (error.keyPattern.phone) {
        return res.status(400).json({ 
          message: 'Ce numéro de téléphone est déjà utilisé' 
        });
      }
    }

    // Gestion des erreurs de validation
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ 
        message: messages.join(', ') 
      });
    }

    res.status(500).json({ 
      message: 'Erreur interne du serveur' 
    });
  }
};

// Vérifier le token et obtenir les infos utilisateur
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ 
        message: 'Utilisateur non trouvé' 
      });
    }

    res.json({
      user: {
        id: user._id,
        prenom: user.prenom,
        nom: user.nom,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Erreur de récupération du profil:', error);
    res.status(500).json({ 
      message: 'Erreur interne du serveur' 
    });
  }
};

// Mettre à jour le profil utilisateur
exports.updateProfile = async (req, res) => {
  try {
    console.log('=== UPDATE PROFILE START ===');
    console.log('Request body:', req.body);
    console.log('User ID from token:', req.userId);
    
    const userId = req.userId;
    const { nom, prenom, email, phone, adresse, currentPassword, newPassword } = req.body;

    // Validation des données d'entrée
    if (!userId) {
      console.log('ERROR: No userId found');
      return res.status(400).json({
        message: 'Utilisateur non identifié'
      });
    }

    // Récupérer l'utilisateur actuel
    console.log('Looking for user with ID:', userId);
    const user = await User.findById(userId);
    if (!user) {
      console.log('ERROR: User not found');
      return res.status(404).json({ 
        message: 'Utilisateur non trouvé' 
      });
    }

    console.log('User found:', user.email);

    // Préparer les données à mettre à jour
    const updateData = {};
    if (nom !== undefined) updateData.nom = nom;
    if (prenom !== undefined) updateData.prenom = prenom;
    if (email !== undefined) updateData.email = email.toLowerCase();
    if (phone !== undefined) updateData.phone = phone;
    if (adresse !== undefined) updateData.adresse = adresse;

    console.log('Update data prepared:', updateData);

    // Si l'utilisateur veut changer son mot de passe
    if (currentPassword && newPassword) {
      console.log('Password change requested');
      
      // Vérifier le mot de passe actuel
      const isCurrentPasswordValid = await user.matchPassword(currentPassword);
      
      if (!isCurrentPasswordValid) {
        console.log('ERROR: Current password invalid');
        return res.status(400).json({
          message: 'Mot de passe actuel incorrect'
        });
      }

      // Valider le nouveau mot de passe
      if (newPassword.length < 6) {
        console.log('ERROR: New password too short');
        return res.status(400).json({
          message: 'Le nouveau mot de passe doit contenir au moins 6 caractères'
        });
      }

      // Hacher le nouveau mot de passe
      console.log('Hashing new password...');
      const saltRounds = 10;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
      updateData.password = hashedNewPassword;
      console.log('Password hashed successfully');
    }

    // Mettre à jour l'utilisateur
    console.log('Updating user in database...');
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { 
        new: true,
        runValidators: true
      }
    ).select('-password');

    if (!updatedUser) {
      console.log('ERROR: Update failed');
      return res.status(500).json({
        message: 'Échec de la mise à jour'
      });
    }

    console.log('User updated successfully');
    console.log('=== UPDATE PROFILE END ===');

    res.json({
      message: 'Profil mis à jour avec succès',
      user: {
        id: updatedUser._id,
        prenom: updatedUser.prenom,
        nom: updatedUser.nom,
        email: updatedUser.email,
        phone: updatedUser.phone,
        adresse: updatedUser.adresse,
        role: updatedUser.role,
        createdAt: updatedUser.createdAt
      }
    });

  } catch (error) {
    console.error('=== UPDATE PROFILE ERROR ===');
    console.error('Error type:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Gestion des erreurs de duplication
    if (error.code === 11000) {
      if (error.keyPattern && error.keyPattern.email) {
        return res.status(400).json({
          message: 'Cette adresse email est déjà utilisée'
        });
      }
      if (error.keyPattern && error.keyPattern.phone) {
        return res.status(400).json({
          message: 'Ce numéro de téléphone est déjà utilisé'
        });
      }
    }

    // Gestion des erreurs de validation
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      message: 'Erreur interne du serveur lors de la mise à jour'
    });
  }
};

// Déconnexion (côté client, supprimer le token)
exports.logout = async (req, res) => {
  res.json({ 
    message: 'Déconnexion réussie' 
  });
};

// Middleware d'authentification
exports.authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        message: 'Accès refusé. Token manquant.' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'votre_secret_jwt_tres_securise');
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        message: 'Token invalide. Utilisateur non trouvé.' 
      });
    }

    req.userId = user._id;
    req.user = user;
    next();
  } catch (error) {
    console.error('Erreur d\'authentification:', error);
    res.status(401).json({ 
      message: 'Token invalide' 
    });
  }
};

// Middleware pour vérifier le rôle admin
exports.requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ 
      message: 'Accès refusé. Droits administrateur requis.' 
    });
  }
};