import { useEffect, useMemo, useRef, useState } from 'react';
import { APP_CONFIG } from '../../../config/app.config.ts';
import type { Appointment } from '../../../types/appointment.ts';
import { getAppointmentDayKey } from '../utils/appointmentSchedule.ts';

interface DayCounts {
  completed: number;
  pending: number;
  canceled: number;
}

export function useAgendaCalendarEngine(appointments: Appointment[]) {
  const config = APP_CONFIG.agenda.calendar;
  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const [rangeEnd, setRangeEnd] = useState<Date | null>(null);
  const [pivotDate, setPivotDate] = useState(() => new Date());
  const [pastBuffer, setPastBuffer] = useState<number>(config.initialPastMonths);
  const [futureBuffer, setFutureBuffer] = useState<number>(config.initialFutureMonths);
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
  const [isEngineLoading, setIsEngineLoading] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const manualScrollRef = useRef(false);

  const appointmentsCountByDay = useMemo(() => appointments.reduce<Record<string, DayCounts>>((map, appointment) => {
    const dayKey = getAppointmentDayKey(appointment.createdAt);
    if (!dayKey) return map;
    const counts = map[dayKey] ?? { completed: 0, pending: 0, canceled: 0 };
    if (appointment.status === 'COMPLETED') counts.completed += 1;
    else if (appointment.status === 'CANCELED') counts.canceled += 1;
    else counts.pending += 1;
    map[dayKey] = counts;
    return map;
  }, {}), [appointments]);

  const monthsData = useMemo(() => {
    const list: Date[] = [];
    for (let offset = -pastBuffer; offset <= futureBuffer; offset += 1) {
      list.push(new Date(pivotDate.getFullYear(), pivotDate.getMonth() + offset, 1));
    }
    return list;
  }, [futureBuffer, pastBuffer, pivotDate]);

  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from(
      { length: config.availableYearsBefore + config.availableYearsAfter + 1 },
      (_, index) => currentYear - config.availableYearsBefore + index
    );
  }, [config.availableYearsAfter, config.availableYearsBefore]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || isEngineLoading) return;
    const observer = new IntersectionObserver((entries) => {
      if (manualScrollRef.current) return;
      const visible = entries.find((entry) => entry.isIntersecting);
      if (!visible) return;
      const year = Number(visible.target.getAttribute('data-year'));
      const month = Number(visible.target.getAttribute('data-month'));
      if (Number.isInteger(year) && Number.isInteger(month)) {
        setSelectedYear(year);
        setSelectedMonth(month);
      }
    }, { root: container, rootMargin: '0px 0px -70% 0px', threshold: 0.05 });

    container.querySelectorAll('[data-month-card]').forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, [isEngineLoading, monthsData]);

  useEffect(() => {
    const now = new Date();
    const id = `month-card-${now.getFullYear()}-${now.getMonth()}`;
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'auto', block: 'start' });
    });
  }, []);

  const handleScrollThreshold = () => {
    const container = scrollContainerRef.current;
    if (!container || manualScrollRef.current || isEngineLoading) return;
    const { scrollTop, scrollHeight, clientHeight } = container;

    if (scrollHeight - scrollTop - clientHeight < config.bottomLoadThresholdPx) {
      setFutureBuffer((current) => current + config.bufferExpansionMonths);
    }
    if (scrollTop < config.topLoadThresholdPx) {
      const previousHeight = container.scrollHeight;
      setPastBuffer((current) => current + config.bufferExpansionMonths);
      requestAnimationFrame(() => {
        container.scrollTop += container.scrollHeight - previousHeight;
      });
    }
  };

  const scrollToMonth = (year: number, month: number) => {
    setSelectedYear(year);
    setSelectedMonth(month);
    const id = `month-card-${year}-${month}`;
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    setIsEngineLoading(true);
    setPivotDate(new Date(year, month, 1));
    setPastBuffer(config.initialPastMonths);
    setFutureBuffer(config.initialFutureMonths);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'auto', block: 'start' });
      setIsEngineLoading(false);
    }));
  };

  const handleDayClick = (dayDate: Date) => {
    if (!rangeStart || rangeEnd) {
      setRangeStart(dayDate);
      setRangeEnd(null);
      return;
    }
    if (dayDate < rangeStart) {
      setRangeStart(dayDate);
      return;
    }
    setRangeEnd(dayDate);
  };

  return {
    rangeStart,
    rangeEnd,
    selectedMonth,
    selectedYear,
    isEngineLoading,
    scrollContainerRef,
    appointmentsCountByDay,
    monthsData,
    availableYears,
    handleScrollThreshold,
    scrollToMonth,
    handleDayClick
  };
}
