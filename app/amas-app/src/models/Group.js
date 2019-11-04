const mongoose = require("mongoose");
const { Schema } = mongoose;
/**
 * @class GroupSchema
 * @param {String} name -Espectro infrarojo de la muestra.
 * @param {[String]} ids - id incremental.
 */
const GroupSchema = new Schema({
    name: {
    type: String,
    required: true,
    unique: true
  },
  ids: [{
    type: Number,
    required: true
  }]
});

module.exports = mongoose.model("Group", GroupSchema);