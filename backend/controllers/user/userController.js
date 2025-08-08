const User = require('../../models/User');

// Obtenir tous les utilisateurs
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Obtenir un utilisateur par ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Créer un utilisateur
exports.createUser = async (req, res) => {
  try {
    const { prenom, nom, email, phone, password, role } = req.body;
    const user = new User({ prenom, nom, email, phone, password, role });
    await user.save();
    res.status(201).json({ message: 'Utilisateur créé', user: { ...user.toObject(), password: undefined } });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Mettre à jour un utilisateur
exports.updateUser = async (req, res) => {
  try {
    const { prenom, nom, email, phone, password, role } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    user.prenom = prenom ?? user.prenom;
    user.nom = nom ?? user.nom;
    user.email = email ?? user.email;
    user.phone = phone ?? user.phone;
    if (password) user.password = password;
    user.role = role ?? user.role;
    await user.save();
    res.json({ message: 'Utilisateur mis à jour', user: { ...user.toObject(), password: undefined } });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Supprimer un utilisateur
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    res.json({ message: 'Utilisateur supprimé' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 