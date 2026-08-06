export type DatePeriod =

  | 'custom' | 'all' | 'today' | 'yesterday' | 'tomorrow'
  | 'this_week' | 'last_week' | 'next_week'
  | 'this_month' | 'last_month' | 'next_month';

interface CustomDateRange {
  start: string | null;
  end: string | null;
}

export function isDateInPeriod(dateString: string, period: DatePeriod, customRange?: CustomDateRange): boolean {
  if (period === 'all') return true;

  const targetDate = new Date(dateString);
  const today = new Date();

  const resetTime = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const todayReset = resetTime(today);
  const targetReset = resetTime(targetDate);
  const oneDayMs = 24 * 60 * 60 * 1000;

  if (period === 'custom') {
    const itemDateString = dateString.substring(0, 10);
    const start = customRange?.start;
    const end = customRange?.end;

    // ✨ Se o usuário escolheu o filtro mas ainda não preencheu AMBOS os campos, lista tudo por padrão
    if (!start || !end) {
      console.log(`[DEBUG COMPARAÇÃO] Aguardando preenchimento total do intervalo...`);
      return true;
    }

    const isInside = itemDateString >= start && itemDateString <= end;

    console.log(`[DEBUG COMPARAÇÃO] Banco: "${itemDateString}" | Filtro Início: "${start}" | Filtro Fim: "${end}" -> Passou no Filtro? ${isInside ? "SIM ✅" : "NÃO ❌"}`);

    return isInside;
  }

  switch (period) {
    case 'today': return targetReset.getTime() === todayReset.getTime();
    case 'yesterday': return targetReset.getTime() === todayReset.getTime() - oneDayMs;
    case 'tomorrow': return targetReset.getTime() === todayReset.getTime() + oneDayMs;
    case 'this_week': {
      const dayOfWeek = todayReset.getDay();
      const startOfWeek = new Date(todayReset.getTime() - dayOfWeek * oneDayMs);
      const endOfWeek = new Date(startOfWeek.getTime() + 6 * oneDayMs);
      return targetReset >= startOfWeek && targetReset <= endOfWeek;
    }
    case 'last_week': {
      const dayOfWeek = todayReset.getDay();
      const startOfLastWeek = new Date(todayReset.getTime() - (dayOfWeek + 7) * oneDayMs);
      const endOfLastWeek = new Date(startOfLastWeek.getTime() + 6 * oneDayMs);
      return targetReset >= startOfLastWeek && targetReset <= endOfLastWeek;
    }
    case 'next_week': {
      const dayOfWeek = todayReset.getDay();
      const startOfNextWeek = new Date(todayReset.getTime() + (7 - dayOfWeek) * oneDayMs);
      const endOfNextWeek = new Date(startOfNextWeek.getTime() + 6 * oneDayMs);
      return targetReset >= startOfNextWeek && targetReset <= endOfNextWeek;
    }
    case 'this_month': return targetDate.getMonth() === today.getMonth() && targetDate.getFullYear() === today.getFullYear();
    case 'last_month': {
      const lastMonth = today.getMonth() === 0 ? 11 : today.getMonth() - 1;
      const year = today.getMonth() === 0 ? today.getFullYear() - 1 : today.getFullYear();
      return targetDate.getMonth() === lastMonth && targetDate.getFullYear() === year;
    }
    case 'next_month': {
      const nextMonth = today.getMonth() === 11 ? 0 : today.getMonth() + 1;
      const year = today.getMonth() === 11 ? today.getFullYear() + 1 : today.getFullYear();
      return targetDate.getMonth() === nextMonth && targetDate.getFullYear() === year;
    }
    default: return true;
  }
}
