import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

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
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
if (userCount.count === 0) {
    // Note: dynamic import replaced with static import for TS, 
    // but we need to ensure bcryptjs is installed.
    // Assuming bcryptjs is available as per package.json
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
            const linkColumns = db.prepare('PRAGMA table_info(links)').all() as any[];
            const hasUserIdInLinks = linkColumns.some(col => col.name === 'user_id');
            
            if (!hasUserIdInLinks) {
                console.log('Migrating links table: adding user_id column');
                const demoUser = db.prepare('SELECT id FROM users WHERE username = ?').get('demo') as { id: number } | undefined;
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
        } catch (error) {
            console.error('Migration error:', error);
        }
    } catch (error) {
        console.error('Migration wrapper error:', error);
    }
};

migrate();

export default db;
