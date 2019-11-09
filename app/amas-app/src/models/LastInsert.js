const mongoose = require('mongoose');
const { Schema } = mongoose;
/**
 * @class LastInsertSchema
 * @param {number} sample - el id incremental de la ultima muestra insertada.
 * @param {number} sample - el id incremental del ultimo modelo creado.
 */
const LastInsertSchema = new Schema({
  sample: {
    type: Number,
    required: true
  },
  model: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model('LastInsert', LastInsertSchema);
