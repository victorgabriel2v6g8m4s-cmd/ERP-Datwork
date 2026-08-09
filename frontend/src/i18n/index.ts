import { APP_CONFIG } from '../config/app.config.ts';
import { PT_BR_TEXTS } from './locales/pt-BR.ts';
import type { AppTextDictionary } from './types.ts';

const TEXT_DICTIONARIES: Record<string, AppTextDictionary> = {
  'pt-BR': PT_BR_TEXTS
};

export const TEXTS = TEXT_DICTIONARIES[APP_CONFIG.locale] ?? PT_BR_TEXTS;
