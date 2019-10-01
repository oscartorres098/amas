const mongoose = require("mongoose");
const { Schema } = mongoose;
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