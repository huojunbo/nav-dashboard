import express, { Request, Response } from 'express';

const router = express.Router();

// Get all todos for current user
router.get('/', (req: Request, res: Response) => {
    try {
        const todos = req.db
            .prepare('SELECT * FROM todos WHERE user_id = ? ORDER BY created_at DESC')
            .all(req.user!.id);
        res.json(todos);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Create new todo
router.post('/', (req: Request, res: Response) => {
    try {
        const { text, completed = false } = req.body;
        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }
        // Convert boolean to integer (0 or 1) for SQLite
        const completedValue = completed ? 1 : 0;
        const stmt = req.db.prepare('INSERT INTO todos (text, completed, user_id) VALUES (?, ?, ?)');
        const result = stmt.run(text, completedValue, req.user!.id);
        const todo = req.db.prepare('SELECT * FROM todos WHERE id = ?').get(result.lastInsertRowid);
        res.status(201).json(todo);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Update todo
router.put('/:id', (req: Request, res: Response) => {
    try {
        const { text, completed } = req.body;
        const updates: string[] = [];
        const values: any[] = [];

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
        values.push(req.params.id, req.user!.id);

        const stmt = req.db.prepare(`UPDATE todos SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`);
        stmt.run(...values);
        const todo = req.db.prepare('SELECT * FROM todos WHERE id = ? AND user_id = ?').get(req.params.id, req.user!.id);
        if (!todo) {
            return res.status(404).json({ error: 'Todo not found' });
        }
        res.json(todo);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Delete todo
router.delete('/:id', (req: Request, res: Response) => {
    try {
        const stmt = req.db.prepare('DELETE FROM todos WHERE id = ? AND user_id = ?');
        const result = stmt.run(req.params.id, req.user!.id);
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Todo not found' });
        }
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
