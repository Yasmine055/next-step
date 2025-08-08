const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  prenom: {
    type: String,
    required: [true, 'Le prénom est requis'],
    trim: true,
    maxlength: [50, 'Le prénom ne peut pas dépasser 50 caractères']
  },
  nom: {
    type: String,
    required: [true, 'Le nom est requis'],
    trim: true,
    maxlength: [50, 'Le nom ne peut pas dépasser 50 caractères']
  },
  email: {
    type: String,
    required: [true, 'L\'email est requis'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Veuillez fournir une adresse email valide'
    ]
  },
  phone: {
    type: String,
    required: [true, 'Le numéro de téléphone est requis'],
    unique: true,
    trim: true,
    match: [
      /^[\+]?[1-9][\d]{0,15}$/,
      'Veuillez fournir un numéro de téléphone valide'
    ]
  },
  adresse: {
    type: String,
    trim: true,
    maxlength: [200, 'L\'adresse ne peut pas dépasser 200 caractères']
  },
  password: {
    type: String,
    required: [true, 'Le mot de passe est requis'],
    minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères']
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
}, {
  timestamps: true // Ajoute automatiquement createdAt et updatedAt
});

// Middleware pour hasher le mot de passe avant la sauvegarde
userSchema.pre('save', async function(next) {
  // Si le mot de passe n'a pas été modifié, passer au suivant
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Hasher le mot de passe
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

// Méthode pour comparer les mots de passe
userSchema.methods.matchPassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Méthode pour obtenir les informations publiques de l'utilisateur
userSchema.methods.getPublicProfile = function() {
  return {
    id: this._id,
    prenom: this.prenom,
    nom: this.nom,
    email: this.email,
    phone: this.phone,
    adresse: this.adresse,
    role: this.role,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

module.exports = mongoose.model('User', userSchema);