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
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS links (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        url TEXT NOT NULL,
        user_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        text TEXT NOT NULL,
        completed BOOLEAN DEFAULT 0,
        user_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
`);

// Create default user if no users exist
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
if (userCount.count === 0) {
    const bcrypt = await import('bcryptjs');
    const defaultPassword = await bcrypt.hash('password123', 10);
    
    db.prepare('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)').run(
        'demo',
        'demo@example.com',
        defaultPassword
    );
}

// Migration: Check and add user_id column if missing (for existing databases)
const migrate = () => {
    try {
        // Check links table
        try {
            const linkColumns = db.prepare('PRAGMA table_info(links)').all();
            const hasUserIdInLinks = linkColumns.some(col => col.name === 'user_id');
            
            if (!hasUserIdInLinks) {
                console.log('Migrating links table: adding user_id column');
                const demoUser = db.prepare('SELECT id FROM users WHERE username = ?').get('demo');
                const defaultUserId = demoUser ? demoUser.id : 1;
                
                db.transaction(() => {
                    // Disable foreign keys temporarily for migration
                    db.pragma('foreign_keys = OFF');
                    
                    db.exec('ALTER TABLE links RENAME TO links_old');
                    db.exec(`
                        CREATE TABLE links (
                            id TEXT PRIMARY KEY,
                            name TEXT NOT NULL,
                            url TEXT NOT NULL,
                            user_id INTEGER NOT NULL DEFAULT ${defaultUserId},
                            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                        )
                    `);
                    db.exec('INSERT INTO links (id, name, url, created_at, updated_at) SELECT id, name, url, created_at, updated_at FROM links_old');
                    db.exec('DROP TABLE links_old');
                    
                    db.pragma('foreign_keys = ON');
                })();
            }
        } catch (e) {
            console.error('Migration error for links:', e);
        }

        // Check todos table
        try {
            const todoColumns = db.prepare('PRAGMA table_info(todos)').all();
            const hasUserIdInTodos = todoColumns.some(col => col.name === 'user_id');
            
            if (!hasUserIdInTodos) {
                console.log('Migrating todos table: adding user_id column');
                const demoUser = db.prepare('SELECT id FROM users WHERE username = ?').get('demo');
                const defaultUserId = demoUser ? demoUser.id : 1;
                
                db.transaction(() => {
                    db.pragma('foreign_keys = OFF');
                    
                    db.exec('ALTER TABLE todos RENAME TO todos_old');
                    db.exec(`
                        CREATE TABLE todos (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            text TEXT NOT NULL,
                            completed BOOLEAN DEFAULT 0,
                            user_id INTEGER NOT NULL DEFAULT ${defaultUserId},
                            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                        )
                    `);
                    db.exec('INSERT INTO todos (id, text, completed, created_at, updated_at) SELECT id, text, completed, created_at, updated_at FROM todos_old');
                    db.exec('DROP TABLE todos_old');
                    
                    db.pragma('foreign_keys = ON');
                })();
            }
        } catch (e) {
            console.error('Migration error for todos:', e);
        }

    } catch (error) {
        console.error('Migration failed:', error);
    }
};

migrate();

// Insert default links for demo user if links table is empty
const linkCount = db.prepare('SELECT COUNT(*) as count FROM links').get();
if (linkCount.count === 0) {
    const demoUserId = db.prepare('SELECT id FROM users WHERE username = ?').get('demo').id;
    
    const defaultLinks = [
        { id: '1', name: 'GitHub', url: 'https://github.com' },
        { id: '2', name: 'YouTube', url: 'https://youtube.com' },
        { id: '3', name: 'Gmail', url: 'https://mail.google.com' },
        { id: '4', name: 'ChatGPT', url: 'https://chat.openai.com' },
        { id: '5', name: 'DeepL', url: 'https://www.deepl.com' },
        { id: '6', name: 'Google Cloud', url: 'https://cloud.google.com' },
    ];

    const insertLink = db.prepare('INSERT INTO links (id, name, url, user_id) VALUES (?, ?, ?, ?)');
    const insertMany = db.transaction((links) => {
        for (const link of links) {
            insertLink.run(link.id, link.name, link.url, demoUserId);
        }
    });
    insertMany(defaultLinks);
}

export default db;