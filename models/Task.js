const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const taskSchema = new Schema({
  title: String,
  description: String,
  priority: String,
  status: String,
  index: Number,
  columnIndex: Number,
});

module.exports = mongoose.model("Task", taskSchema);
