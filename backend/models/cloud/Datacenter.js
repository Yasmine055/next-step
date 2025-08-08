
const mongoose = require('mongoose');

const datacenterSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true,
    trim: true
  },
  emplacement: {
    type: String,
    required: true,
    trim: true
  }
});

module.exports = mongoose.model('Datacenter', datacenterSchema);
