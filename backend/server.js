const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const datacenterRoutes = require('./routes/cloud/datacenterRoutes');
const equipmentTypeRoutes = require('./routes/cloud/equipmentTypeRoutes');
const equipmentRoutes = require('./routes/cloud/equipmentRoutes');
const categoryRoutes = require('./routes/cloud/categoryRoutes');
const reseauEquipmentTypeRoutes = require('./routes/reseau/reseauEquipmentTypeRoutes');
const reseauEquipmentRoutes = require('./routes/reseau/reseauEquipmentRoutes');
const userRoutes = require('./routes/user/userRoutes');
const authRoutes = require('./routes/user/authRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/datacenters', datacenterRoutes);
app.use('/api/equipment-types', equipmentTypeRoutes);
app.use('/api/equipments', equipmentRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/reseau-equipment-types', reseauEquipmentTypeRoutes);
app.use('/api/reseau-equipments', reseauEquipmentRoutes);
app.use('/api/users', userRoutes);

app.use('/api/auth', authRoutes);


// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/datacenter_db')
  .then(() => console.log('Connecté à MongoDB'))
  .catch(err => console.error('Erreur de connexion à MongoDB:', err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
