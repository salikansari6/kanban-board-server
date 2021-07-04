const TaskCollection = require("../models/TaskCollection");

const router = require("express").Router();

router.get("/:userId", async (req, res) => {
  const result = await TaskCollection.find({ userId: req.params.userId });
  res.send(result);
});

router.post("/:userId", async (req, res) => {
  const newUserTasks = await TaskCollection.create({
    userId: req.params.userId,
    tasks: [
      { title: "To-Do", columnColor: "red", items: [] },
      { title: "In-Progress", columnColor: "yellow", items: [] },
      { title: "Done", columnColor: "green", items: [] },
    ],
  });
  res.send(newUserTasks);
});

router.put("/:userId", async (req, res) => {
  console.log(req.body.tasks);
  const updatedUserTasks = await TaskCollection.findOneAndUpdate(
    { userId: req.params.userId },
    { tasks: req.body.tasks }
  );
  res.send(updatedUserTasks);
});

module.exports = router;
