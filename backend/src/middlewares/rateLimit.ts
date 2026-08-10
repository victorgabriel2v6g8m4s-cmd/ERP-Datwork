import type { NextFunction, Request, Response } from 'express';
import { SERVER_CONFIG } from '../config/serverConfig.js';

interface ClientWindow {
  count: number;
  resetAt: number;
}

const clients = new Map<string, ClientWindow>();

function pruneExpiredClients(now: number): void {
  if (clients.size < SERVER_CONFIG.http.rateLimit.maxTrackedClients) return;
  for (const [key, value] of clients) {
    if (value.resetAt <= now) clients.delete(key);
  }
}

export function rateLimit(req: Request, res: Response, next: NextFunction): Response | void {
  const now = Date.now();
  pruneExpiredClients(now);

  const key = req.ip || req.socket.remoteAddress || 'unknown';
  if (!clients.has(key) && clients.size >= SERVER_CONFIG.http.rateLimit.maxTrackedClients) {
    return res.status(429).json({ error: 'TooManyTrackedClients' });
  }

  const current = clients.get(key);
  const window = !current || current.resetAt <= now
    ? { count: 0, resetAt: now + SERVER_CONFIG.http.rateLimit.windowMs }
    : current;

  window.count += 1;
  clients.set(key, window);

  res.setHeader('RateLimit-Limit', String(SERVER_CONFIG.http.rateLimit.maxRequests));
  res.setHeader('RateLimit-Remaining', String(Math.max(0, SERVER_CONFIG.http.rateLimit.maxRequests - window.count)));
  res.setHeader('RateLimit-Reset', String(Math.ceil(window.resetAt / 1000)));

  if (window.count > SERVER_CONFIG.http.rateLimit.maxRequests) {
    res.setHeader('Retry-After', String(Math.ceil((window.resetAt - now) / 1000)));
    return res.status(429).json({ error: 'TooManyRequests' });
  }

  next();
}
