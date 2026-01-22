import { Database } from 'better-sqlite3';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username: string;
        email: string;
      };
      db: Database;
    }
  }
}

export {};
