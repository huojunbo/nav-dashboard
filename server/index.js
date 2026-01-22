import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import db from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging for debugging
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// Make db available to routes
app.use((req, res, next) => {
    req.db = db;
    next();
});

// Routes
import linksRouter from './routes/links.js';
import todosRouter from './routes/todos.js';

app.use('/api/links', linksRouter);
app.use('/api/todos', todosRouter);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files from the Vite build output
// This comes AFTER API routes so API takes precedence
const distPath = join(__dirname, '..', 'dist');
console.log('Serving static files from:', distPath);
console.log('__dirname:', __dirname);

// Configure static file serving with explicit options for Express 5.x
app.use(express.static(distPath, {
    index: 'index.html',
    fallthrough: true,
    setHeaders: (res, path) => {
        console.log('Serving static file:', path);
    }
}));

// SPA fallback - serve index.html for all non-API routes
// This must come after static files middleware
app.use((req, res, next) => {
    // Only handle GET requests that are not API calls and not static files
    if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.includes('.')) {
        console.log('SPA fallback for:', req.path);
        res.sendFile(join(distPath, 'index.html'), (err) => {
            if (err) {
                console.error('Error sending index.html:', err);
                next(err);
            }
        });
    } else {
        next();
    }
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// Keep the process alive in environments where stdin closure causes exit
process.stdin.resume();
