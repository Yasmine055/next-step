const express = require('express');
const router = express.Router();
const ReseauEquipment = require('../../models/reseaux/ReseauEquipment');
const mongoose = require('mongoose');

// Créer un équipement réseau
router.post('/', async (req, res) => {
  try {
    const equipment = new ReseauEquipment(req.body);
    await equipment.save();
    res.status(201).json(equipment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✅ ROUTE MODIFIÉE : Lire tous les équipements réseau avec support du filtrage par typeId
router.get('/', async (req, res) => {
  try {
    const { typeId } = req.query;
    
    // Si typeId est fourni en query param, filtrer par ce critère
    let query = {};
    if (typeId) {
      // Vérifier si typeId est un ObjectId valide
      if (!mongoose.Types.ObjectId.isValid(typeId)) {
        return res.status(400).json({ error: 'ID de type invalide' });
      }
      query.typeId = typeId; // ✅ Utilise 'typeId' selon votre schéma
    }
    
    const list = await ReseauEquipment.find(query).populate('typeId'); // ✅ Populate sur 'typeId'
    res.json(list);
  } catch (err) {
    console.error('Erreur lors de la récupération des équipements:', err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ ROUTE CORRIGÉE : Lire les équipements par type (utilise typeId au lieu de equipmentTypeId)
router.get('/type/:typeId', async (req, res) => {
  try {
    const { typeId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(typeId)) {
      return res.status(400).json({ error: 'ID de type invalide' });
    }

    const list = await ReseauEquipment.find({ typeId: typeId }).populate('typeId'); // ✅ Utilise 'typeId'
    console.log(`Équipements trouvés pour typeId ${typeId}:`, list.length);
    res.json(list);
  } catch (err) {
    console.error('Erreur lors de la récupération par type:', err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ NOUVELLE ROUTE : Alias pour la compatibilité avec votre composant React
router.get('/by-type/:typeId', async (req, res) => {
  try {
    const { typeId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(typeId)) {
      return res.status(400).json({ error: 'ID de type invalide' });
    }

    const list = await ReseauEquipment.find({ typeId: typeId }).populate('typeId');
    console.log(`Équipements trouvés via by-type pour ${typeId}:`, list.length);
    res.json(list);
  } catch (err) {
    console.error('Erreur lors de la récupération by-type:', err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ ROUTE CORRIGÉE : Lire un seul équipement
router.get('/:id', async (req, res) => {
  try {
    const equipment = await ReseauEquipment.findById(req.params.id).populate('typeId'); // ✅ Populate sur 'typeId'
    if (!equipment) {
      return res.status(404).json({ error: 'Équipement non trouvé' });
    }
    res.json(equipment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ ROUTE CORRIGÉE : Mettre à jour un équipement
router.put('/:id', async (req, res) => {
  try {
    const equipment = await ReseauEquipment.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    ).populate('typeId'); // ✅ Populate sur 'typeId'

    if (!equipment) {
      return res.status(404).json({ error: 'Équipement non trouvé' });
    }

    console.log('Équipement mis à jour:', equipment._id);
    res.json(equipment);
  } catch (err) {
    console.error('Erreur lors de la mise à jour:', err);
    res.status(500).json({ error: err.message });
  }
});

// Supprimer un équipement
router.delete('/:id', async (req, res) => {
  try {
    const equipment = await ReseauEquipment.findByIdAndDelete(req.params.id);
    if (!equipment) {
      return res.status(404).json({ error: 'Équipement non trouvé' });
    }
    console.log('Équipement supprimé:', equipment._id);
    res.json({ message: 'Équipement supprimé avec succès' });
  } catch (err) {
    console.error('Erreur lors de la suppression:', err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ NOUVELLE ROUTE : Route de debug pour vérifier la structure des données
router.get('/debug/all', async (req, res) => {
  try {
    const list = await ReseauEquipment.find().limit(5); // Limite à 5 pour éviter de surcharger
    console.log('Debug - Premiers équipements:', JSON.stringify(list, null, 2));
    res.json({
      count: await ReseauEquipment.countDocuments(),
      sample: list,
      schema_fields: Object.keys(ReseauEquipment.schema.paths)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;