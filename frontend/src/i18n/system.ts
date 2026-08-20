import { APP_CONFIG } from '../config/app.config.ts';
import { PT_BR_SYSTEM_TEXTS } from './locales/pt-BR/system.ts';

const SYSTEM_DICTIONARIES = {
  'pt-BR': PT_BR_SYSTEM_TEXTS
} as const;

export const SYSTEM_TEXTS = SYSTEM_DICTIONARIES[APP_CONFIG.locale] ?? PT_BR_SYSTEM_TEXTS;
