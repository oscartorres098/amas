const mongoose = require("mongoose");
const { Schema } = mongoose;
const MlModelSchema = new Schema({
  scaler: {
    type: String
  },
  pre_method: {
    type: String
  },
  train_method: {
    type: String
  },
  rr: {
    type: Number,
    required: true
  },
  mse: {
    type: Number,
  },
  modelo: {
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
  }
});
module.exports = mongoose.model("MlModel", MlModelSchema);