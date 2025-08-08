const mongoose = require('mongoose');

const EquipmentSchema = new mongoose.Schema({
  datacenterId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Datacenter', 
    required: true 
  },
  typeId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'EquipmentType', 
    required: true,
    index: true
  },
  data: { 
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: new Map()
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Index pour améliorer les performances des requêtes
EquipmentSchema.index({ typeId: 1 });
EquipmentSchema.index({ datacenterId: 1 });

module.exports = mongoose.model('Equipment', EquipmentSchema); 