const mongoose = require('mongoose');
const { Schema } = mongoose;

const LastInsertSSchema = new Schema({
  lastId: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model('Last', LastInsertSSchema);
