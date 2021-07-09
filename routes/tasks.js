const TaskCollection = require("../models/TaskCollection");
const { isAuthenticated } = require("../middlewares/isAuthenticated");
const router = require("express").Router();

router.get("/:userId", isAuthenticated, async (req, res) => {
  const result = await TaskCollection.find({ userId: req.params.userId });
  res.send(result);
});

router.post("/:userId", isAuthenticated, async (req, res) => {
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

router.delete("/deleteCard/:userId", isAuthenticated, async (req, res) => {
  const taskCollection = await TaskCollection.findOne({
    userId: req.params.userId,
  });
  taskCollection.tasks[req.body.columnIndex].items = taskCollection.tasks[
    req.body.columnIndex
  ].items.filter((i) => i.id !== req.body.cardId);
  await taskCollection.save();
  res.json({ success: true });
});

router.put("/updateCard/:userId", isAuthenticated, async (req, res) => {
  const { updatedValues, columnIndex, id } = req.body;

  const taskCollection = await TaskCollection.findOne({
    userId: req.params.userId,
  });

  taskCollection.tasks[columnIndex].items = taskCollection.tasks[
    columnIndex
  ].items.map((t) => {
    if (t.id !== id) {
      return t;
    } else {
      return {
        ...t.toObject(),
        ...updatedValues,
      };
    }
  });

  await taskCollection.save();
  res.json({ success: true });
});

router.post("/add/:userId", isAuthenticated, async (req, res) => {
  console.log(req.user._id);
  const taskCollection = await TaskCollection.findOne({
    userId: req.params.userId,
  });
  taskCollection.tasks[req.body.columnIndex].items.unshift(req.body.card);
  const newCollection = await taskCollection.save();
  res.json(newCollection);
});

router.put("/moveItem/:userId", isAuthenticated, async (req, res) => {
  const taskCollection = await TaskCollection.findOne({
    userId: req.params.userId,
  });
  taskCollection.tasks[req.body.toColumnIndex].items.splice(
    req.body.hoveredOverIndex,
    0,
    taskCollection.tasks[req.body.fromColumnIndex].items.splice(
      req.body.draggedOverIndex,
      1
    )[0]
  );
  await taskCollection.save();
  res.json({ success: true });
});

router.put("/moveColumn/:userId", isAuthenticated, async (req, res) => {
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
  await taskCollection.save();
  res.json({ success: true });
});

module.exports = router;
