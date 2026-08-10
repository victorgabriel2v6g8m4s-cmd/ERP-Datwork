import type { NextFunction, Request, Response } from 'express';
import { SERVER_CONFIG } from '../config/serverConfig.js';
import { CustomLogger } from '../logger/CustomLogger.js';

let bypassWarningLogged = false;
let missingAuthenticationLogged = false;

export function isAuthenticated(_req: Request, res: Response, next: NextFunction): Response | void {
  if (SERVER_CONFIG.auth.allowInsecureDevelopmentBypass) {
    if (!bypassWarningLogged) {
      bypassWarningLogged = true;
      CustomLogger.warn('[Auth] Development bypass enabled. Production remains fail-closed.');
    }
    next();
    return;
  }

  if (!missingAuthenticationLogged) {
    missingAuthenticationLogged = true;
    CustomLogger.error('[Auth] Protected routes are unavailable because production authentication is not configured');
  }
  return res.status(503).json({
    error: 'AuthenticationNotConfigured',
    message: 'A autenticação de produção ainda não foi configurada.'
  });
}
