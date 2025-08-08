const express = require('express');
const router = express.Router();
const Equipment = require('../../models/cloud/Equipment');
const mongoose = require('mongoose');

// POST: ajouter un équipement dynamique
router.post('/', async (req, res) => {
  try {
    console.log('Création d\'un équipement:', req.body);
    const newEquipment = new Equipment(req.body);
    await newEquipment.save();
    console.log('Équipement créé:', newEquipment);
    res.status(201).json(newEquipment);
  } catch (err) {
    console.error('Erreur création équipement:', err);
    res.status(400).json({ error: err.message });
  }
});

// GET: équipements par datacenter
router.get('/datacenter/:id', async (req, res) => {
  try {
    console.log('Récupération des équipements pour le datacenter:', req.params.id);
    const list = await Equipment.find({ datacenterId: req.params.id })
      .populate('typeId');
    console.log('Équipements trouvés:', list);
    res.json(list);
  } catch (err) {
    console.error('Erreur récupération équipements:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET: équipements par type
router.get('/type/:typeId', async (req, res) => {
  try {
    const { typeId } = req.params;
    console.log('Récupération des équipements par type:', typeId);

    if (!mongoose.Types.ObjectId.isValid(typeId)) {
      return res.status(400).json({ error: 'ID de type invalide' });
    }

    const list = await Equipment.find({ typeId }).populate('typeId');
    console.log('Équipements trouvés:', list);
    res.json(list);
  } catch (err) {
    console.error('Erreur récupération équipements:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET: équipements par type dans un datacenter
router.get('/datacenter/:datacenterId/type/:typeId', async (req, res) => {
  try {
    const { datacenterId, typeId } = req.params;
    console.log('Récupération des équipements par type:', { datacenterId, typeId });

    // Vérifier que les IDs sont valides
    if (!mongoose.Types.ObjectId.isValid(datacenterId) || !mongoose.Types.ObjectId.isValid(typeId)) {
      return res.status(400).json({ error: 'ID invalide' });
    }

    const list = await Equipment.find({
      datacenterId: datacenterId,
      typeId: typeId
    }).populate('typeId');

    console.log('Équipements trouvés:', list);
    res.json(list);
  } catch (err) {
    console.error('Erreur récupération équipements:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET: un équipement spécifique
router.get('/:id', async (req, res) => {
  try {
    console.log('Récupération de l\'équipement:', req.params.id);
    const equipment = await Equipment.findById(req.params.id)
      .populate('typeId');
    if (!equipment) {
      return res.status(404).json({ error: 'Équipement non trouvé' });
    }
    console.log('Équipement trouvé:', equipment);
    res.json(equipment);
  } catch (err) {
    console.error('Erreur récupération équipement:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT: mettre à jour un équipement
router.put('/:id', async (req, res) => {
  try {
    console.log('Mise à jour de l\'équipement:', req.params.id, req.body);
    const equipment = await Equipment.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    ).populate('typeId');

    if (!equipment) {
      return res.status(404).json({ error: 'Équipement non trouvé' });
    }

    console.log('Équipement mis à jour:', equipment);
    res.json(equipment);
  } catch (err) {
    console.error('Erreur mise à jour équipement:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE: supprimer un équipement
router.delete('/:id', async (req, res) => {
  try {
    console.log('Suppression de l\'équipement:', req.params.id);
    const equipment = await Equipment.findByIdAndDelete(req.params.id);
    if (!equipment) {
      return res.status(404).json({ error: 'Équipement non trouvé' });
    }
    console.log('Équipement supprimé:', equipment);
    res.json({ message: 'Équipement supprimé avec succès' });
  } catch (err) {
    console.error('Erreur suppression équipement:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 