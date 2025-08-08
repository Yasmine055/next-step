const mongoose = require('mongoose');

const fieldSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['text', 'number', 'date', 'email']
  },
  label: {
    type: String,
    required: true
  }
}, { _id: false });

const EquipmentTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  datacenterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Datacenter',
    required: true
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  imageUrl: {
    type: String,
    default: '/default-equipment.png' // URL par défaut si aucune image n'est spécifiée
  },
  fields: [fieldSchema]
});

module.exports = mongoose.model('EquipmentType', EquipmentTypeSchema); 