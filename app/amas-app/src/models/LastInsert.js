const mongoose = require('mongoose');
const { Schema } = mongoose;

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
