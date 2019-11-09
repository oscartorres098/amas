const mongoose = require("mongoose");
const { Schema } = mongoose;
/**
 * @class SampleSchema
 * @param {String} espectro -Espectro infrerojo de la muestra.
 * @param {String} mid - id incremental.
 * @param {String} labels - Etiquetas de las propiedaes la muestra de suelo.
 * @param {number} prediction - Arreglo con las estimaciones hechas a patir de los modelos.
 * @param {Date} fechaSubida - Fecha en la que se creó el objeto.
 * @param {String} detail - Detalle asignado por el usuario.
 * @param {String} user - id del usuario que subió la muestra.
 */
const SampleSchema = new Schema({
  espectro: [{
    type: String,
    required: true
  }],
  mid: [{
    type: Number,
    required: true
  }],
  labels: [{
    type: Number,
  }],
  prediction: [{
    type: String,
  }],
  fechaSubida: {
    type: Date,
    default: Date.now
  },
  detail: {
    type: String
  },
  user: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model("Sample", SampleSchema);