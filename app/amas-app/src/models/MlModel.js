const mongoose = require("mongoose");
const { Schema } = mongoose;
/**
 * @class MlModelSchema
 * @param {String} nombre - Nombre del modelo.
 * @param {String} scaler - Metodo de escalador.
 * @param {String} preprocessing - Metodo de preprosamiento.
 * @param {number} model - Metodo de entrenamiento.
 * @param {number} rr - Velor del coeficiente de determinación por propiedad.
 * @param {number} mse - Valor del error cuadratico medio por propiedad.
 * @param {number} cross_val_score - Valor de la crossvalidación por propiedad.
 * @param {buffer} name - Nombre devueto por el api de flask.
 * @param {Date} fechaSubida - Fecha en la que se creó el objeto.
 * @param {String} detail - Detalle asignado por el usuario.
 * @param {String} user - id del usuario que creó el modelo.
 */
const MlModelSchema = new Schema({
  nombre: {
    type: String
  },
  scaler: {
    type: String
  },
  preprocessing: {
    type: String
  },
  model: {
    type: String
  },
  rr: [{
    type: Number,
  }],
  mse: [{
    type: Number,
  }],
  cross_val_score: [{
    type: Number,
  }],
  name: {
    type: Buffer,
  },
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
  },
  modelstr: {
    type: String
  },
  scalerstr: {
    type: String
  }
});

module.exports = mongoose.model("MlModel", MlModelSchema);