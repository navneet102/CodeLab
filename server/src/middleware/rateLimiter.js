// Simple in-memory rate limiter for code execution
// In production, use Redis-based rate limiting
const rateLimits = new Map();

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10;     // 10 executions per minute per user

const rateLimiter = (req, res, next) => {
  const key = req.body.username || req.ip;
  const now = Date.now();

  if (!rateLimits.has(key)) {
    rateLimits.set(key, { count: 1, windowStart: now });
    return next();
  }

  const entry = rateLimits.get(key);

  // Reset window if expired
  if (now - entry.windowStart > WINDOW_MS) {
    entry.count = 1;
    entry.windowStart = now;
    return next();
  }

  // Check limit
  if (entry.count >= MAX_REQUESTS) {
    return res.status(429).json({
      error: 'Too many code executions. Please wait a moment.',
    });
  }

  entry.count++;
  next();
};

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimits) {
    if (now - entry.windowStart > WINDOW_MS * 2) {
      rateLimits.delete(key);
    }
  }
}, WINDOW_MS);

module.exports = rateLimiter;
