import { useState, useMemo, useEffect, useRef } from 'react';
import { type Appointment } from '../../../types/appointment.ts';
import { CustomLogger } from '../../../utils/CustomLogger.ts';

export function useAgendaCalendarEngine(appointments: Appointment[]) {
    const [rangeStart, setRangeStart] = useState<Date | null>(null);
    const [rangeEnd, setRangeEnd] = useState<Date | null>(null);

    // Âncora Central Temporal: Define qual mês/ano serve de pivô para a fita
    const [pivotDate, setPivotDate] = useState<Date>(new Date());
    const [pastBuffer, setPastBuffer] = useState<number>(6);
    const [futureBuffer, setFutureBuffer] = useState<number>(6);

    // Estados dos Selects do topo sincronizados
    const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [isEngineLoading, setIsEngineLoading] = useState<boolean>(false);

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const isScrollingManuallyRef = useRef<boolean>(false);

    // 🤖 MOTOR 1: Indexador de Atendimentos por Data Real (createdAt)
    const appointmentsCountByDay = useMemo(() => {
        CustomLogger.info('[Calendar Engine] Computando mapa cronológico de status para o grid.');
        const map: Record<string, { completed: number; pending: number; canceled: number }> = {};

        appointments.forEach((apt) => {
            const rawDate = apt.createdAt || (apt as any).date || apt.time;
            if (!rawDate) return;

            const d = new Date(rawDate);
            if (isNaN(d.getTime())) return;

            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            const localDayKey = `${year}-${month}-${day}`;

            if (!map[localDayKey]) {
                map[localDayKey] = { completed: 0, pending: 0, canceled: 0 };
            }

            if (apt.status === 'COMPLETED') map[localDayKey].completed += 1;
            else if (apt.status === 'PENDING') map[localDayKey].pending += 1;
            else if (apt.status === 'CANCELED') map[localDayKey].canceled += 1;
        });

        return map;
    }, [appointments]);

    // 🤖 MOTOR 2: Fita Cronológica Elástica Dinâmica baseada no Buffer e no Pivô
    const monthsData = useMemo(() => {
        const list = [];
        for (let i = -pastBuffer; i <= futureBuffer; i++) {
            list.push(new Date(pivotDate.getFullYear(), pivotDate.getMonth() + i, 1));
        }
        return list;
    }, [pivotDate, pastBuffer, futureBuffer]);

    // 🤖 MOTOR 3: Menu dinâmico de anos estendido
    const availableYears = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let y = currentYear - 3; y <= currentYear + 3; y++) {
            years.push(y);
        }
        return years;
    }, []);

    // 🤖 MOTOR 4: IntersectionObserver para sincronizar a rolagem com os Menus do topo
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container || isEngineLoading) return;

        const observerOptions = {
            root: container,
            rootMargin: '0px 0px -70% 0px',
            threshold: 0.05
        };

        const observer = new IntersectionObserver((entries) => {
            if (isScrollingManuallyRef.current) return;

            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const year = parseInt(entry.target.getAttribute('data-year') || '0', 10);
                    const month = parseInt(entry.target.getAttribute('data-month') || '0', 10);
                    if (year && !isNaN(month)) {
                        setSelectedYear(year);
                        setSelectedMonth(month);
                    }
                }
            });
        }, observerOptions);

        container.querySelectorAll('[data-month-card]').forEach(card => observer.observe(card));

        return () => observer.disconnect();
    }, [monthsData, isEngineLoading]);

    // 🤖 MOTOR 5: Ancoragem Inicial no nascimento do componente
    useEffect(() => {
        if (isEngineLoading) return;

        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        setSelectedYear(currentYear);
        setSelectedMonth(currentMonth);

        const targetId = `month-card-${currentYear}-${currentMonth}`;

        setTimeout(() => {
            const currentMonthElement = document.getElementById(targetId);
            if (currentMonthElement && scrollContainerRef.current) {
                isScrollingManuallyRef.current = true;
                currentMonthElement.scrollIntoView({ behavior: 'auto', block: 'start' });
                setTimeout(() => { isScrollingManuallyRef.current = false; }, 100);
            }
        }, 60);
    }, [isEngineLoading]);

    // 🤖 MOTOR 6: Gatilho de Rolagem Infinita Física (Gera novos meses nas bordas)
    const handleScrollThreshold = () => {
        const container = scrollContainerRef.current;
        if (!container || isScrollingManuallyRef.current || isEngineLoading) return;

        const { scrollTop, scrollHeight, clientHeight } = container;

        if (scrollHeight - scrollTop - clientHeight < 150) {
            setFutureBuffer(prev => prev + 4);
        }

        if (scrollTop < 80) {
            isScrollingManuallyRef.current = true;
            const preInsertScrollHeight = container.scrollHeight;
            const preInsertScrollTop = container.scrollTop;

            setPastBuffer(prev => prev + 4);

            setTimeout(() => {
                if (container) {
                    container.scrollTop = preInsertScrollTop + (container.scrollHeight - preInsertScrollHeight);
                    setTimeout(() => { isScrollingManuallyRef.current = false; }, 50);
                }
            }, 30);
        }
    };

    // 🎯 DISPARADOR DE SALTO RÁPIDO COM LAZY LOADING ASSISTIDO
    const scrollToMonth = async (year: number, month: number) => {
        isScrollingManuallyRef.current = true;
        setSelectedYear(year);
        setSelectedMonth(month);

        const targetId = `month-card-${year}-${month}`;
        const element = document.getElementById(targetId);

        if (element && scrollContainerRef.current) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setTimeout(() => { isScrollingManuallyRef.current = false; }, 600);
        } else {
            setIsEngineLoading(true);
            CustomLogger.info(`[Calendar] Salto longo ativado para data fora do buffer: ${year}/${month}`);
            await new Promise(resolve => setTimeout(resolve, 400));

            setPivotDate(new Date(year, month, 1));
            setPastBuffer(6);
            setFutureBuffer(6);
            setIsEngineLoading(false);

            setTimeout(() => {
                document.getElementById(`month-card-${year}-${month}`)?.scrollIntoView({ behavior: 'auto', block: 'start' });
                isScrollingManuallyRef.current = false;
            }, 50);
        }
    };

    const handleDayClick = (dayDate: Date) => {
        if (!rangeStart || (rangeStart && rangeEnd)) {
            setRangeStart(dayDate);
            setRangeEnd(null);
        } else if (rangeStart && !rangeEnd) {
            if (dayDate < rangeStart) {
                setRangeStart(dayDate);
            } else {
                setRangeEnd(dayDate);
            }
        }
    };

    return {
        rangeStart, rangeEnd, selectedMonth, selectedYear, isEngineLoading,
        scrollContainerRef, appointmentsCountByDay, monthsData, availableYears,
        handleScrollThreshold, scrollToMonth, handleDayClick
    };
}
