const mongoose = require("mongoose");
const { Schema } = mongoose;
const MlModelSchema = new Schema({
  tipo: {
    type: String
  },
  mid: {
    type: String
  },
  user: {
    type: String
  }
});

module.exports = mongoose.model("MlModel", MlModelSchema);