const mongoose = require('mongoose');

const ReseauEquipmentSchema = new mongoose.Schema({

  typeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ReseauEquipmentType',
    required: true
  },
 
 
  customFields: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, { timestamps: true });

module.exports = mongoose.model('ReseauEquipment', ReseauEquipmentSchema);
