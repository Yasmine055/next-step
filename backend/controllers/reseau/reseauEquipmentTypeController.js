const ReseauEquipmentType = require('../../models/reseaux/ReseauEquipmentType');

// Créer un nouveau type d'équipement réseau
exports.createReseauEquipmentType = async (req, res) => {
  try {
    console.log('BODY:', req.body);
    const { name, fields } = req.body;

    if (!name || typeof name !== 'string') {
      return res.status(400).json({ message: "Le nom est requis" });
    }

    if (!Array.isArray(fields) || fields.some(f => !f.name || !f.type || !f.label)) {
      return res.status(400).json({ message: "Champs invalides ou manquants" });
    }

    const reseauEquipmentType = new ReseauEquipmentType({ name, fields });
    await reseauEquipmentType.save();
    res.status(201).json(reseauEquipmentType);
  } catch (error) {
    console.error("Erreur backend:", error);
    res.status(400).json({ message: error.message });
  }
};


// Obtenir tous les types d’équipement réseau
exports.getAllReseauEquipmentTypes = async (req, res) => {
  try {
    const types = await ReseauEquipmentType.find();
    res.json(types);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtenir un type d'équipement réseau par ID
exports.getReseauEquipmentTypeById = async (req, res) => {
  try {
    const reseauEquipmentType = await ReseauEquipmentType.findById(req.params.id);
    if (!reseauEquipmentType) {
      return res.status(404).json({ message: 'Type d\'équipement réseau non trouvé' });
    }
    res.json(reseauEquipmentType);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mettre à jour un type d'équipement réseau
exports.updateReseauEquipmentType = async (req, res) => {
  try {
    const { name, fields } = req.body;
    const reseauEquipmentType = await ReseauEquipmentType.findByIdAndUpdate(
      req.params.id,
      { name, fields },
      { new: true }
    );
    if (!reseauEquipmentType) {
      return res.status(404).json({ message: 'Type d\'équipement réseau non trouvé' });
    }
    res.json(reseauEquipmentType);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Supprimer un type d'équipement réseau
exports.deleteReseauEquipmentType = async (req, res) => {
  try {
    const reseauEquipmentType = await ReseauEquipmentType.findByIdAndDelete(req.params.id);
    if (!reseauEquipmentType) {
      return res.status(404).json({ message: 'Type d\'équipement réseau non trouvé' });
    }
    res.json({ message: 'Type d\'équipement réseau supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
