const mongoose = require("mongoose");
const TaskGroup = require("./TaskGroup");
const Schema = mongoose.Schema;

const taskCollectionSchema = new Schema({
  userId: String,
  tasks: [TaskGroup],
});

module.exports = mongoose.model("TaskCollection", taskCollectionSchema);
