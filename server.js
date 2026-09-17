const express = require("express");
const dotenv = require("dotenv");
const crypto = require("crypto");

dotenv.config();

const app = express();
const PORT = 5000;

app.use(express.json());

// In-memory data store for tasks
let tasks = [];

// Request logger
app.use((req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    next();
});

app.get("/", (req, res) => {
  res.send("Server is running successfully 🚀");
});


// ==========================================
// GET ALL TASKS
// ==========================================

app.get("/tasks", (req, res) => {
  try {
    // check if tasks exists
    if (!tasks || !Array.isArray(tasks)) {
      return res.status(200).json([]);
    }

    const sortedTasks = [...tasks].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    res.status(200).json(sortedTasks);

  } catch (err) {
    res.status(500).json({
      error: "Internal Server Error",
      message: err.message
    });
  }
});


// ==========================================
// GET SINGLE TASK
// ==========================================

app.get("/tasks/:id", (req, res) => {
    try {
        const task = tasks.find((t) => t.id === req.params.id);

        if (!task) {
            return res.status(404).json({
                error: "Task Not Found",
                message: "No task exists with the provided ID"
            });
        }

        res.status(200).json(task);
    } catch (err) {
        res.status(500).json({
            error: "Internal Server Error",
            message: "Something went wrong on the server"
        });
    }
});


// ==========================================
// CREATE TASK
// ==========================================

app.post("/tasks", (req, res) => {
    try {
        const { title, description, completed, priority } = req.body;

        // Title validation
        if (!title || typeof title !== "string" || !title.trim()) {
            return res.status(400).json({
                error: "Validation Error",
                errors: [
                    {
                        field: "title",
                        message: "Title is required"
                    }
                ]
            });
        }

        // Priority validation
        const validPriorities = ["low", "medium", "high"];
        if (priority && !validPriorities.includes(priority)) {
            return res.status(400).json({
                error: "Validation Error",
                errors: [
                    {
                        field: "priority",
                        message: "Priority must be low, medium, or high"
                    }
                ]
            });
        }

        const newTask = {
            id: crypto.randomUUID(),
            title: title.trim(),
            description: description || "",
            completed: typeof completed === "boolean" ? completed : false,
            priority: priority || "medium",
            createdAt: new Date().toISOString()
        };

        tasks.push(newTask);

        res.status(201).json(newTask);
    } catch (err) {
        res.status(500).json({
            error: "Internal Server Error",
            message: "Something went wrong on the server"
        });
    }
});


// ==========================================
// UPDATE TASK
// ==========================================

app.put("/tasks/:id", (req, res) => {
    try {
        const task = tasks.find((t) => t.id === req.params.id);

        if (!task) {
            return res.status(404).json({
                error: "Task Not Found",
                message: "No task exists with the provided ID"
            });
        }

        const { title, description, completed, priority } = req.body;

        // Title validation if provided
        if (title !== undefined) {
            if (typeof title !== "string" || !title.trim()) {
                return res.status(400).json({
                    error: "Validation Error",
                    errors: [
                        {
                            field: "title",
                            message: "Title cannot be empty"
                        }
                    ]
                });
            }
            task.title = title.trim();
        }

        // Priority validation if provided
        if (priority !== undefined) {
            const validPriorities = ["low", "medium", "high"];
            if (!validPriorities.includes(priority)) {
                return res.status(400).json({
                    error: "Validation Error",
                    errors: [
                        {
                            field: "priority",
                            message: "Priority must be low, medium, or high"
                        }
                    ]
                });
            }
            task.priority = priority;
        }

        if (description !== undefined) {
            task.description = description;
        }

        if (completed !== undefined) {
            task.completed = Boolean(completed);
        }

        res.status(200).json(task);
    } catch (err) {
        res.status(500).json({
            error: "Internal Server Error",
            message: "Something went wrong on the server"
        });
    }
});


// ==========================================
// DELETE TASK
// ==========================================

app.delete("/tasks/:id", (req, res) => {
    try {
        const index = tasks.findIndex((t) => t.id === req.params.id);

        if (index === -1) {
            return res.status(404).json({
                error: "Task Not Found",
                message: "No task exists with the provided ID"
            });
        }

        const [deletedTask] = tasks.splice(index, 1);

        res.status(200).json({
            message: "Task Deleted Successfully",
            deletedTask: deletedTask
        });
    } catch (err) {
        res.status(500).json({
            error: "Internal Server Error",
            message: "Something went wrong on the server"
        });
    }
});


// ==========================================
// GLOBAL ERROR HANDLER
// ==========================================

app.use((err, req, res, next) => {
    console.error(err.message);

    res.status(500).json({
        error: "Internal Server Error",
        message: "Something went wrong on the server"
    });
});


// ==========================================
// START SERVER
// ==========================================

app.listen(PORT, () => {
    console.log(`Server Running on Port ${PORT}`);
});