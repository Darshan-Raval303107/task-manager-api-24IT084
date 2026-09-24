const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./db");
const Task = require("./models/Task");

// Load environment variables
dotenv.config();

// Connect to MongoDB Database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// ==========================================
// ROUTES
// ==========================================

// Welcome / Health check route
app.get("/", (req, res) => {
  res.send("Server & MongoDB are running successfully 🚀");
});

// 1. GET ALL TASKS
app.get("/tasks", async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch tasks", message: err.message });
  }
});

// 2. GET A SINGLE TASK BY ID
app.get("/tasks/:id", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: "Task Not Found" });
    }
    res.status(200).json(task);
  } catch (err) {
    res.status(400).json({ error: "Invalid Task ID or Server Error", message: err.message });
  }
});

// 3. CREATE A NEW TASK
app.post("/tasks", async (req, res) => {
  try {
    const { title, description, completed, priority } = req.body;
    const newTask = await Task.create({
      title,
      description,
      completed,
      priority,
    });
    res.status(201).json(newTask);
  } catch (err) {
    res.status(400).json({ error: "Validation Error", message: err.message });
  }
});

// 4. UPDATE A TASK BY ID
app.put("/tasks/:id", async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ error: "Task Not Found" });
    }

    res.status(200).json(updatedTask);
  } catch (err) {
    res.status(400).json({ error: "Failed to update task", message: err.message });
  }
});

// 5. DELETE A TASK BY ID
app.delete("/tasks/:id", async (req, res) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);

    if (!deletedTask) {
      return res.status(404).json({ error: "Task Not Found" });
    }

    res.status(200).json({
      message: "Task Deleted Successfully",
      deletedTask,
    });
  } catch (err) {
    res.status(400).json({ error: "Failed to delete task", message: err.message });
  }
});

// ==========================================
// START SERVER
// ==========================================
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});