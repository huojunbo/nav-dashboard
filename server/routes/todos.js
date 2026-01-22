import express from 'express';

const router = express.Router();

// Get all todos
router.get('/', (req, res) => {
    try {
        const todos = req.db.prepare('SELECT * FROM todos ORDER BY created_at DESC').all();
        res.json(todos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create new todo
router.post('/', (req, res) => {
    try {
        const { text, completed = false } = req.body;
        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }
        // Convert boolean to integer (0 or 1) for SQLite
        const completedValue = completed ? 1 : 0;
        const stmt = req.db.prepare('INSERT INTO todos (text, completed) VALUES (?, ?)');
        const result = stmt.run(text, completedValue);
        const todo = req.db.prepare('SELECT * FROM todos WHERE id = ?').get(result.lastInsertRowid);
        res.status(201).json(todo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update todo
router.put('/:id', (req, res) => {
    try {
        const { text, completed } = req.body;
        const updates = [];
        const values = [];

        if (text !== undefined) {
            updates.push('text = ?');
            values.push(text);
        }
        if (completed !== undefined) {
            updates.push('completed = ?');
            // Convert boolean to integer for SQLite
            values.push(completed ? 1 : 0);
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        updates.push('updated_at = CURRENT_TIMESTAMP');
        values.push(req.params.id);

        const stmt = req.db.prepare(`UPDATE todos SET ${updates.join(', ')} WHERE id = ?`);
        stmt.run(...values);
        const todo = req.db.prepare('SELECT * FROM todos WHERE id = ?').get(req.params.id);
        if (!todo) {
            return res.status(404).json({ error: 'Todo not found' });
        }
        res.json(todo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete todo
router.delete('/:id', (req, res) => {
    try {
        const stmt = req.db.prepare('DELETE FROM todos WHERE id = ?');
        stmt.run(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
