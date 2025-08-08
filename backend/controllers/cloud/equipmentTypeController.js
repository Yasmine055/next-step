const EquipmentType = require('../../models/cloud/EquipmentType');

// Créer un nouveau type d'équipement
exports.createEquipmentType = async (req, res) => {
  try {
    const { name, datacenterId, categoryId, fields } = req.body;
    const equipmentType = new EquipmentType({
      name,
      datacenterId,
      categoryId,
      fields
    });
    await equipmentType.save();
    res.status(201).json(equipmentType);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Obtenir tous les types d'équipement d'une catégorie
exports.getEquipmentTypesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const equipmentTypes = await EquipmentType.find({ categoryId });
    res.json(equipmentTypes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtenir un type d'équipement par ID
exports.getEquipmentTypeById = async (req, res) => {
  try {
    const equipmentType = await EquipmentType.findById(req.params.id);
    if (!equipmentType) {
      return res.status(404).json({ message: 'Type d\'équipement non trouvé' });
    }
    res.json(equipmentType);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mettre à jour un type d'équipement
exports.updateEquipmentType = async (req, res) => {
  try {
    const { name, fields } = req.body;
    const equipmentType = await EquipmentType.findByIdAndUpdate(
      req.params.id,
      { name, fields },
      { new: true }
    );
    if (!equipmentType) {
      return res.status(404).json({ message: 'Type d\'équipement non trouvé' });
    }
    res.json(equipmentType);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Supprimer un type d'équipement
exports.deleteEquipmentType = async (req, res) => {
  try {
    const equipmentType = await EquipmentType.findByIdAndDelete(req.params.id);
    if (!equipmentType) {
      return res.status(404).json({ message: 'Type d\'équipement non trouvé' });
    }
    res.json({ message: 'Type d\'équipement supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 