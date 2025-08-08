const express = require('express');
const router = express.Router();
const equipmentTypeController = require('../../controllers/cloud/equipmentTypeController');

// Routes pour les types d'équipement
router.post('/', equipmentTypeController.createEquipmentType);
router.get('/category/:categoryId', equipmentTypeController.getEquipmentTypesByCategory);
router.get('/:id', equipmentTypeController.getEquipmentTypeById);
router.put('/:id', equipmentTypeController.updateEquipmentType);
router.delete('/:id', equipmentTypeController.deleteEquipmentType);

module.exports = router; 