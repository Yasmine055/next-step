const Category = require('../../models/cloud/Category');
const EquipmentType = require('../../models/cloud/EquipmentType');

// Créer une nouvelle catégorie
exports.createCategory = async (req, res) => {
  try {
    const { name, datacenterId } = req.body;
    if (!name || !datacenterId) {
      return res.status(400).json({ message: 'Le nom et l\'ID du datacenter sont requis' });
    }
    const category = new Category({
      name,
      datacenter: datacenterId
    });
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    console.error('Erreur lors de la création de la catégorie:', error);
    res.status(400).json({ message: error.message });
  }
};

// Obtenir toutes les catégories d'un datacenter
exports.getCategoriesByDatacenter = async (req, res) => {
  try {
    const { datacenterId } = req.params;
    if (!datacenterId) {
      return res.status(400).json({ message: 'L\'ID du datacenter est requis' });
    }
    const categories = await Category.find({ datacenter: datacenterId });
    res.json(categories);
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error);
    res.status(500).json({ message: error.message });
  }
};

// Obtenir une catégorie par ID
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Catégorie non trouvée' });
    }
    res.json(category);
  } catch (error) {
    console.error('Erreur lors de la récupération de la catégorie:', error);
    res.status(500).json({ message: error.message });
  }
};

// Mettre à jour une catégorie
exports.updateCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Le nom est requis' });
    }
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true }
    );
    if (!category) {
      return res.status(404).json({ message: 'Catégorie non trouvée' });
    }
    res.json(category);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la catégorie:', error);
    res.status(400).json({ message: error.message });
  }
};

// Supprimer une catégorie
exports.deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;

    // Supprimer d'abord tous les types d'équipement associés
    await EquipmentType.deleteMany({ categoryId });

    // Ensuite, supprimer la catégorie
    const category = await Category.findByIdAndDelete(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Catégorie non trouvée' });
    }

    res.json({ 
      message: 'Catégorie et tous ses types d\'équipement supprimés avec succès',
      deletedCategory: category
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de la catégorie:', error);
    res.status(500).json({ message: error.message });
  }
}; 