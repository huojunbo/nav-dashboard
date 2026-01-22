import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { signToken, verifyToken } from '../middleware/auth.js';
// Note: importing .js extension is required if we don't change module resolution, 
// but since we are moving to tsx/ts-node, we should probably update imports to be extension-less or use .js if using "type": "module" in package.json with TS.
// TS with "module": "nodenext" or "preserve" usually requires .js extension for relative imports.
// However, since we are converting everything to TS, let's keep the .js extension in imports if we plan to compile, 
// OR if we use tsx which handles it. 
// Ideally, we should update imports to refer to the TS files if we are not compiling yet, but standard TS in Node ESM requires .js extension.
// Let's stick to .js extension for imports as it is standard for ESM TS.

const router = express.Router();

router.post('/register', (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'username, email and password are required' });
    }
    const existingUser = req.db.prepare('SELECT id FROM users WHERE email = ? OR username = ?').get(email, username);
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }
    const passwordHash = bcrypt.hashSync(password, 10);
    const result = req.db
      .prepare('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)')
      .run(username, email, passwordHash);
    const userId = result.lastInsertRowid;

    // Add default links for new user
    const defaultLinks = [
        { id: Date.now().toString(), name: 'GitHub', url: 'https://github.com' },
        { id: (Date.now() + 1).toString(), name: 'YouTube', url: 'https://youtube.com' },
        { id: (Date.now() + 2).toString(), name: 'Gmail', url: 'https://mail.google.com' },
        { id: (Date.now() + 3).toString(), name: 'ChatGPT', url: 'https://chat.openai.com' },
        { id: (Date.now() + 4).toString(), name: 'DeepL', url: 'https://www.deepl.com' },
        { id: (Date.now() + 5).toString(), name: 'Google Cloud', url: 'https://cloud.google.com' },
    ];

    const insertLink = req.db.prepare('INSERT INTO links (id, name, url, user_id) VALUES (?, ?, ?, ?)');
    const insertMany = req.db.transaction((links: typeof defaultLinks) => {
        for (const link of links) {
            insertLink.run(link.id, link.name, link.url, userId);
        }
    });
    insertMany(defaultLinks);

    const user = req.db.prepare('SELECT id, username, email FROM users WHERE id = ?').get(userId) as any;
    const token = signToken({ id: user.id, username: user.username, email: user.email });
    return res.status(201).json({ token, user });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

router.post('/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }
    const user = req.db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const ok = bcrypt.compareSync(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = signToken({ id: user.id, username: user.username, email: user.email });
    return res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

router.get('/me', verifyToken, (req: Request, res: Response) => {
  try {
    // req.user is guaranteed to exist due to verifyToken middleware
    const user = req.db.prepare('SELECT id, username, email, created_at FROM users WHERE id = ?').get(req.user!.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json({ user });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
