const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
  // id: { type: String, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
});

module.exports = mongoose.model('database', postSchema);