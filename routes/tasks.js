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

router.post("/add/:userId", async (req, res) => {
  const taskCollection = await TaskCollection.findOne({
    userId: req.params.userId,
  });
  taskCollection.tasks[req.body.columnIndex].items.unshift(req.body.card);
  const newCollection = await taskCollection.save();
  res.json(newCollection);
});

router.put("/moveColumn/:userId", async (req, res) => {
  console.log(req.body.card);
  console.log(req.body.fromColumnIndex);
  console.log(req.body.toColumnIndex);

  const taskCollection = await TaskCollection.findOne({
    userId: req.params.userId,
  });
  taskCollection.tasks[req.body.toColumnIndex].items.splice(
    taskCollection.tasks[req.body.toColumnIndex].items.length,
    0,
    taskCollection.tasks[req.body.fromColumnIndex].items.splice(
      req.body.card.index,
      1
    )[0]
  );
  const newCollection = await taskCollection.save();
  res.send(newCollection);
});

module.exports = router;
