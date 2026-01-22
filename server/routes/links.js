import express from 'express';

const router = express.Router();

// Get all links
router.get('/', (req, res) => {
    try {
        const links = req.db.prepare('SELECT * FROM links ORDER BY created_at DESC').all();
        res.json(links);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create new link
router.post('/', (req, res) => {
    try {
        const { name, url } = req.body;
        if (!name || !url) {
            return res.status(400).json({ error: 'Name and url are required' });
        }
        const id = Date.now().toString();
        const stmt = req.db.prepare('INSERT INTO links (id, name, url) VALUES (?, ?, ?)');
        stmt.run(id, name, url);
        const link = req.db.prepare('SELECT * FROM links WHERE id = ?').get(id);
        res.status(201).json(link);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update link
router.put('/:id', (req, res) => {
    try {
        const { name, url } = req.body;
        if (!name || !url) {
            return res.status(400).json({ error: 'Name and url are required' });
        }
        const stmt = req.db.prepare(
            'UPDATE links SET name = ?, url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
        );
        stmt.run(name, url, req.params.id);
        const link = req.db.prepare('SELECT * FROM links WHERE id = ?').get(req.params.id);
        if (!link) {
            return res.status(404).json({ error: 'Link not found' });
        }
        res.json(link);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete link
router.delete('/:id', (req, res) => {
    try {
        const stmt = req.db.prepare('DELETE FROM links WHERE id = ?');
        stmt.run(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
