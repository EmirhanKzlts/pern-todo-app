import { Router } from "express";
import pool from "../db.js"

const router = Router();

// Create a new todo
router.post("/", async (req, res) => {
    try {
        const { description, completed } = req.body;
        if (!description) {
            return res.status(400).json({ error: "Description is required"})
        }
        const newTodo = await pool.query(
            "INSERT INTO todo (description, completed) VALUES ($1, $2) RETURNING *",
            [description, completed || false]
        );
        res.status(201).json(newTodo.rows[0]);
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Server Error");
    }
});

// Get all todos
router.get("/", async (req, res) => {
    try {
        const allTodos = await pool.query("SELECT * FROM todo ORDER BY todo_id ASC");
        res.status(200).json(allTodos.rows);
    } catch (err) {
        console.log(err.message);
        res.status(500).send("Server Error");
    }
});

// Get a todo by id
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const selectedTodo = await pool.query("SELECT * FROM todo WHERE todo_id = $1", [id]);
        if (selectedTodo.rows.length === 0) {
            return res.status(404).json({ message: "Todo not found" });
        }
        res.status(200).json(selectedTodo.rows[0]);
    } catch (err) {
        console.log(err.message);
        res.status(500).send("Server Error");
    }
});

// Update a todo
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { description, completed } = req.body;
        if (!description) {
            return res.status(400).json({ error: "Description is required"})
        }
        const updateTodo = await pool.query(
            "UPDATE todo SET description = $1, completed = $2 WHERE todo_id = $3 RETURNING *",
            [description, completed || false, id]
        );
        if (updateTodo.rows.length === 0) {
            return res.status(404).json({ message: "Todo not found" });
        }
        res.status(200).json({
            message: "Todo was updated!",
            todo: updateTodo.rows[0]
        });
    } catch (err) {
        console.log(err.message);
        res.status(500).send("Server Error");
    }
});

// Delete a todo
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const deletedTodo = await pool.query("DELETE FROM todo WHERE todo_id = $1 RETURNING *", [id]);
        if (deletedTodo.rows.length === 0) {
            return res.status(404).json({ error: "Todo not found" })
        }
        res.status(200).json("Todo was deleted!");
    } catch (err) {
        console.log(err.message);
        res.status(500).send("Server Error");
    }
});

export default router;

