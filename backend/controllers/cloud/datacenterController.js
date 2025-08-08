const Datacenter = require('../../models/cloud/Datacenter');
const mongoose = require('mongoose');

// Créer un nouveau datacenter
exports.createDatacenter = async (req, res) => {
  try {
    console.log('Création d\'un datacenter:', req.body);
    const { nom, emplacement } = req.body;
    const datacenter = new Datacenter({ nom, emplacement });
    const savedDatacenter = await datacenter.save();
    console.log('Datacenter créé:', savedDatacenter);
    res.status(201).json(savedDatacenter);
  } catch (error) {
    console.error('Erreur création datacenter:', error);
    res.status(400).json({ message: error.message });
  }
};

// Obtenir tous les datacenters
exports.getAllDatacenters = async (req, res) => {
  try {
    console.log('Récupération de tous les datacenters');
    const datacenters = await Datacenter.find();
    console.log('Datacenters trouvés:', datacenters);
    res.json(datacenters);
  } catch (error) {
    console.error('Erreur récupération datacenters:', error);
    res.status(500).json({ message: error.message });
  }
};

// Obtenir un datacenter par ID
exports.getDatacenterById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Recherche datacenter par ID:', id);

    // Vérifier si l'ID est valide
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      console.error('ID de datacenter invalide:', id);
      return res.status(400).json({ message: "ID de datacenter invalide" });
    }

    const datacenter = await Datacenter.findById(id);
    if (!datacenter) {
      console.log('Datacenter non trouvé');
      return res.status(404).json({ message: "Datacenter non trouvé" });
    }
    console.log('Datacenter trouvé:', datacenter);
    res.json(datacenter);
  } catch (error) {
    console.error('Erreur recherche datacenter:', error);
    res.status(500).json({ message: error.message });
  }
};

// Modifier un datacenter
exports.updateDatacenter = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Modification datacenter:', id, req.body);

    // Vérifier si l'ID est valide
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      console.error('ID de datacenter invalide:', id);
      return res.status(400).json({ message: "ID de datacenter invalide" });
    }

    const { nom, emplacement } = req.body;
    const updatedDatacenter = await Datacenter.findByIdAndUpdate(
      id,
      { nom, emplacement },
      { new: true }
    );
    if (!updatedDatacenter) {
      console.log('Datacenter non trouvé pour modification');
      return res.status(404).json({ message: "Datacenter non trouvé" });
    }
    console.log('Datacenter modifié:', updatedDatacenter);
    res.json(updatedDatacenter);
  } catch (error) {
    console.error('Erreur modification datacenter:', error);
    res.status(400).json({ message: error.message });
  }
};

// Supprimer un datacenter
exports.deleteDatacenter = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Tentative de suppression du datacenter avec ID:', id);

    // Vérifier si l'ID est valide
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      console.error('ID de datacenter invalide:', id);
      return res.status(400).json({ message: "ID de datacenter invalide" });
    }

    // Vérifier si le datacenter existe avant de le supprimer
    const datacenter = await Datacenter.findById(id);
    if (!datacenter) {
      console.log('Datacenter non trouvé pour suppression, ID:', id);
      return res.status(404).json({ message: "Datacenter non trouvé" });
    }

    // Supprimer le datacenter
    const deletedDatacenter = await Datacenter.findByIdAndDelete(id);
    console.log('Datacenter supprimé avec succès:', deletedDatacenter);
    
    res.json({ 
      message: "Datacenter supprimé avec succès",
      datacenter: deletedDatacenter
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du datacenter:', error);
    res.status(500).json({ 
      message: "Erreur lors de la suppression du datacenter",
      error: error.message 
    });
  }
};
