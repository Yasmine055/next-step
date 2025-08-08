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

const ReseauEquipmentTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  // Supprimé datacenterId et categoryId
  imageUrl: {
    type: String,
    default: '/default-reseau-equipment.png'
  },
  fields: [fieldSchema]
}, { timestamps: true });

module.exports = mongoose.model('ReseauEquipmentType', ReseauEquipmentTypeSchema);