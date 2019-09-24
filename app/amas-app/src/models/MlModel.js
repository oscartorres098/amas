const mongoose = require("mongoose");
const { Schema } = mongoose;
const MlModelSchema = new Schema({
  scaler: {
    type: String
  },
  preprocessing: {
    type: String
  },
  model: {
    type: String
  },
  rr: {
    type: Number,
    required: true
  },
  mse: {
    type: Number,
  },
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
  }
});

module.exports = mongoose.model("MlModel", MlModelSchema);