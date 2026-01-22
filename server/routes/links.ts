import express, { Request, Response } from 'express';

const router = express.Router();

// Get all links for current user
router.get('/', (req: Request, res: Response) => {
    try {
        const links = req.db
            .prepare('SELECT * FROM links WHERE user_id = ? ORDER BY created_at DESC')
            .all(req.user!.id);
        res.json(links);
    } catch (error: any) {
        console.error('Error deleting link:', error);
        res.status(500).json({ error: error.message });
    }
});

// Create new link
router.post('/', (req: Request, res: Response) => {
    try {
        const { name, url } = req.body;
        if (!name || !url) {
            return res.status(400).json({ error: 'Name and url are required' });
        }
        const id = Date.now().toString();
        const stmt = req.db.prepare('INSERT INTO links (id, name, url, user_id) VALUES (?, ?, ?, ?)');
        stmt.run(id, name, url, req.user!.id);
        const link = req.db.prepare('SELECT * FROM links WHERE id = ?').get(id);
        res.status(201).json(link);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Update link
router.put('/:id', (req: Request, res: Response) => {
    try {
        const { name, url } = req.body;
        if (!name || !url) {
            return res.status(400).json({ error: 'Name and url are required' });
        }
        const stmt = req.db.prepare(
            'UPDATE links SET name = ?, url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?'
        );
        stmt.run(name, url, req.params.id, req.user!.id);
        const link = req.db.prepare('SELECT * FROM links WHERE id = ? AND user_id = ?').get(req.params.id, req.user!.id);
        if (!link) {
            return res.status(404).json({ error: 'Link not found' });
        }
        res.json(link);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Delete link
router.delete('/:id', (req: Request, res: Response) => {
    try {
        const stmt = req.db.prepare('DELETE FROM links WHERE id = ? AND user_id = ?');
        const result = stmt.run(req.params.id, req.user!.id);
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Link not found' });
        }
        res.status(204).send();
    } catch (error: any) {
        console.error('Delete link error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
