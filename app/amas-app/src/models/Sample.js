const mongoose = require('mongoose');
const { Schema } = mongoose;

const MuestraSchema = new Schema({
  espectro: {
    type: [],
    required: true
  },
  fechaToma: {
    type: String,
    required: true
  },
  fechaSubida: {
    type: Date,
    default: Date.now
  },
  investigador: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Muestra', MuestraSchema);