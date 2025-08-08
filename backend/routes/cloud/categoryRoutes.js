const express = require('express');
const router = express.Router();
const categoryController = require('../../controllers/cloud/categoryController');

// Routes pour les catégories
router.post('/', categoryController.createCategory);
router.get('/datacenter/:datacenterId', categoryController.getCategoriesByDatacenter);
router.get('/:id', categoryController.getCategoryById);
router.put('/:id', categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

module.exports = router; 