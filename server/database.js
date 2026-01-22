import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, 'data');
const dbPath = path.join(dataDir, 'dashboard.db');

// Create data directory if it doesn't exist
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
    CREATE TABLE IF NOT EXISTS links (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        url TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        text TEXT NOT NULL,
        completed BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
`);

// Insert default links if table is empty
const linkCount = db.prepare('SELECT COUNT(*) as count FROM links').get();
if (linkCount.count === 0) {
    const defaultLinks = [
        { id: '1', name: 'GitHub', url: 'https://github.com' },
        { id: '2', name: 'YouTube', url: 'https://youtube.com' },
        { id: '3', name: 'Gmail', url: 'https://mail.google.com' },
        { id: '4', name: 'ChatGPT', url: 'https://chat.openai.com' },
        { id: '5', name: 'DeepL', url: 'https://www.deepl.com' },
        { id: '6', name: 'Google Cloud', url: 'https://cloud.google.com' },
    ];

    const insertLink = db.prepare('INSERT INTO links (id, name, url) VALUES (?, ?, ?)');
    const insertMany = db.transaction((links) => {
        for (const link of links) {
            insertLink.run(link.id, link.name, link.url);
        }
    });
    insertMany(defaultLinks);
}

export default db;
