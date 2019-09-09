const mongoose = require("mongoose");
const { Schema } = mongoose;
const SampleSchema = new Schema({
  espectro: [{
    type: String,
    required: true
  }],
  labels: [{
    type: Number,
    required: true
  }],
  prediction: [{
    type: String,
    required: false
  }],
  fechaSubida: {
    type: Date,
    default: Date.now
  },
  detail: {
    type: String,
    required: false
  },
  user: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model("Sample", SampleSchema);