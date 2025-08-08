const express = require('express');
const router = express.Router();
const controller = require('../../controllers/reseau/reseauEquipmentTypeController');

// CRUD pour les types d’équipement réseau
router.post('/', controller.createReseauEquipmentType);
router.get('/', controller.getAllReseauEquipmentTypes); // tous les types
router.get('/:id', controller.getReseauEquipmentTypeById);
router.put('/:id', controller.updateReseauEquipmentType);
router.delete('/:id', controller.deleteReseauEquipmentType);

module.exports = router;
