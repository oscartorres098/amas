const mongoose = require("mongoose");
const { Schema } = mongoose;
/**
 * @class RegistrolSchema
 * @param {String} tipo -Espectro infrerojo de la muestra.
 * @param {String} mid - id incremental.
 * @param {Date} fechaSubida - Fecha en la que se creó el objeto.
 * @param {String} user - id del usuario que subió la muestra.
 */
const RegistrolSchema = new Schema({
  tipo: {
    type: String
  },
  mid: {
    type: String
  },
  user: {
    type: String
  },
  fecha: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Registro", RegistrolSchema);