const mongoose = require("mongoose");
const { Schema } = mongoose;
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