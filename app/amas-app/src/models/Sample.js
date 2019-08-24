const mongoose = require("mongoose");
const { Schema } = mongoose;
const SampleSchema = new Schema({
  espectro: [{
    type: Number,
    required: true
  }],
  labels: [{
    type: Number,
    required: true
  }],
  prediction: [{
    type: Number,
    required: true
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