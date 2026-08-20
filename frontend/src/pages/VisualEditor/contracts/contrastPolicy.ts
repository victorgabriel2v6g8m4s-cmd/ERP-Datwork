import type { VisualOverride } from './visualEditor.types.ts';

export const WCAG_AA_NORMAL_TEXT_RATIO = 4.5;

function parseHexColor(value: string): [number, number, number] | null {
  const match = /^#([0-9a-f]{6})$/i.exec(value);
  if (!match) return null;
  const hex = match[1];
  return [Number.parseInt(hex.slice(0, 2), 16), Number.parseInt(hex.slice(2, 4), 16), Number.parseInt(hex.slice(4, 6), 16)];
}

function relativeLuminance(color: [number, number, number]): number {
  const channels = color.map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

export function calculateContrastRatio(foreground: string, background: string): number | null {
  const foregroundColor = parseHexColor(foreground);
  const backgroundColor = parseHexColor(background);
  if (!foregroundColor || !backgroundColor) return null;
  const foregroundLuminance = relativeLuminance(foregroundColor);
  const backgroundLuminance = relativeLuminance(backgroundColor);
  const lightest = Math.max(foregroundLuminance, backgroundLuminance);
  const darkest = Math.min(foregroundLuminance, backgroundLuminance);
  return (lightest + 0.05) / (darkest + 0.05);
}

export function findContrastFailure(overrides: readonly VisualOverride[]): { uiKey: string; ratio: number | null } | null {
  const uiKeys = new Set(overrides.map((override) => override.uiKey));
  for (const uiKey of uiKeys) {
    const foreground = overrides.find((override) => override.uiKey === uiKey && override.property === 'color')?.value;
    const background = overrides.find((override) => override.uiKey === uiKey && override.property === 'backgroundColor')?.value;
    if (!foreground && !background) continue;
    if (!foreground || !background) return { uiKey, ratio: null };
    const ratio = calculateContrastRatio(foreground, background);
    if (ratio === null || ratio < WCAG_AA_NORMAL_TEXT_RATIO) return { uiKey, ratio };
  }
  return null;
}
