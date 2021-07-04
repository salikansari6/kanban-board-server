const TaskCollection = require("../models/TaskCollection");

const router = require("express").Router();

router.get("/:userId", async (req, res) => {
  const result = await TaskCollection.find({ userId: userId });
  console.log(result);
});

module.exports = router;
