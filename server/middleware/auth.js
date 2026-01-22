import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_dev_secret';

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const parts = authHeader.split(' ');
  if (parts.length === 2 && parts[0] === 'Bearer') {
    const token = parts[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = { id: decoded.id, username: decoded.username, email: decoded.email };
      return next();
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  }
  return res.status(401).json({ error: 'Authorization header missing' });
}

