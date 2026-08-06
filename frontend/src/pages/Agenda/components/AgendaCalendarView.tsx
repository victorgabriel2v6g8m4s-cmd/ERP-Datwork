import { useState, useMemo, useEffect, useRef } from 'react';
import { ChevronLeft, ArrowRight, Loader2 } from 'lucide-react';
import { type Appointment } from '../../../types/appointment.ts';

interface AgendaCalendarViewProps {
    appointments: Appointment[];
    onSelectRange: (start: Date, end: Date) => void;
    onBack: () => void;
}

export function AgendaCalendarView({ appointments, onSelectRange, onBack }: AgendaCalendarViewProps) {
    const [rangeStart, setRangeStart] = useState<Date | null>(null);
    const [rangeEnd, setRangeEnd] = useState<Date | null>(null);

    // 🗓️ Âncora Central Temporal: Define qual mês/ano serve de pivô para a renderização
    const [pivotDate, setPivotDate] = useState<Date>(new Date());

    // Margem de meses para renderizar antes e depois do pivô (Raio de visão de 1 ano completo)
    const [pastBuffer, setPastBuffer] = useState<number>(6);
    const [futureBuffer, setFutureBuffer] = useState<number>(6);

    // Estados dos Selects do topo
    const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

    // Estado de carregamento elástico para saltos longos de menus
    const [isEngineLoading, setIsEngineLoading] = useState<boolean>(false);

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const isScrollingManuallyRef = useRef<boolean>(false);

    // 🤖 MOTOR 1: Indexador de Atendimentos por Data Real (createdAt)
    const appointmentsCountByDay = useMemo(() => {
        // A estrutura do mapa guardará: { "YYYY-MM-DD": { completed: 0, pending: 0, canceled: 0 } }
        const map: { [key: string]: { completed: number; pending: number; canceled: number } } = {};

        appointments.forEach((apt) => {
            const rawDate = apt.createdAt || (apt as any).date || apt.time;
            if (!rawDate) return;

            const d = new Date(rawDate);
            if (isNaN(d.getTime())) return;

            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            const localDayKey = `${year}-${month}-${day}`;

            // Inicializa o objeto do dia caso ele nasça agora no laço
            if (!map[localDayKey]) {
                map[localDayKey] = { completed: 0, pending: 0, canceled: 0 };
            }

            // Máquina de Classificação Cromática de Fila
            if (apt.status === 'COMPLETED') {
                map[localDayKey].completed += 1;
            } else if (apt.status === 'PENDING') {
                map[localDayKey].pending += 1;
            } else if (apt.status === 'CANCELED') {
                map[localDayKey].canceled += 1;
            }
        });

        return map;
    }, [appointments]);

    // 🤖 MOTOR 2: Fita Cronológica Elástica Dinâmica baseada no Buffer e no Pivô
    const monthsData = useMemo(() => {
        const list = [];
        // Varre do limite do passado até o limite do futuro de forma elástica
        for (let i = -pastBuffer; i <= futureBuffer; i++) {
            const targetMonth = new Date(pivotDate.getFullYear(), pivotDate.getMonth() + i, 1);
            list.push(targetMonth);
        }
        return list;
    }, [pivotDate, pastBuffer, futureBuffer]);

    // 🤖 MOTOR 3: Menu dinâmico de anos estendido (Garante opções de -3 a +3 anos do ano atual)
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

        const monthCards = container.querySelectorAll('[data-month-card]');
        monthCards.forEach(card => observer.observe(card));

        return () => observer.disconnect();
    }, [monthsData, isEngineLoading]);

    // 🤖 MOTOR 5: Gatilho de Rolagem Infinita Física (Gera novos meses ao tocar nas bordas do scroll)
    const handleScrollThreshold = () => {
        const container = scrollContainerRef.current;
        if (!container || isScrollingManuallyRef.current || isEngineLoading) return;

        const scrollTop = container.scrollTop;
        const scrollHeight = container.scrollHeight;
        const clientHeight = container.clientHeight;

        // ➡️ TOCOU NA BASE (ROLOU PRO FUTURO): Injeta mais 4 meses para frente de forma leve
        if (scrollHeight - scrollTop - clientHeight < 150) {
            setFutureBuffer(prev => prev + 4);
        }

        // ⬅️ TOCOU NO TOPO (ROLOU PRO PASSADO): Injeta mais 4 meses para trás com compensação de pixel
        if (scrollTop < 80) {
            // 🛡️ BLOQUEIO DE SEGURANÇA: Avisa o sistema que estamos manipulando o scroll mecanicamente
            isScrollingManuallyRef.current = true;

            const preInsertScrollHeight = container.scrollHeight;
            const preInsertScrollTop = container.scrollTop;

            // Injeta mais meses no passado
            setPastBuffer(prev => prev + 4);

            // 📐 COMPENSAÇÃO MATEMÁTICA DE CORREDOR VISUAL:
            // Executa logo após o React injetar os novos elementos no DOM, anulando o tranco físico
            setTimeout(() => {
                if (container) {
                    const postInsertScrollHeight = container.scrollHeight;
                    // O novo scroll é a posição antiga + a diferença de pixels ganhada no topo
                    container.scrollTop = preInsertScrollTop + (postInsertScrollHeight - preInsertScrollHeight);

                    // Libera a trava de rolagem manual de forma suave
                    setTimeout(() => {
                        isScrollingManuallyRef.current = false;
                    }, 50);
                }
            }, 30);
        }
    };

    useEffect(() => {
        // 🛡️ Cláusula de Barreira: Só dispara a ancoragem se a tela de loading não estiver ativa
        if (isEngineLoading) return;

        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        // Sincroniza preventivamente as caixas de select com o mês atual da máquina
        setSelectedYear(currentYear);
        setSelectedMonth(currentMonth);

        // Identifica o ID único do card do mês vigente (Ex: month-card-2026-7)
        const targetId = `month-card-${currentYear}-${currentMonth}`;

        // Força o navegador a saltar milimetricamente para o pixel zero do mês atual
        setTimeout(() => {
            const currentMonthElement = document.getElementById(targetId);
            if (currentMonthElement && scrollContainerRef.current) {
                // Bloqueia temporariamente os sensores para evitar loops de animação
                isScrollingManuallyRef.current = true;

                currentMonthElement.scrollIntoView({ behavior: 'auto', block: 'start' });

                // Libera a esteira de rolagem livre logo em seguida
                setTimeout(() => {
                    isScrollingManuallyRef.current = false;
                }, 100);
            }
        }, 60); // Pequeno delay seguro para aguardar a montagem completa do DOM no navegador
    }, [isEngineLoading]);

    // 🎯 DISPARADOR DE SALTO RÁPIDO COM LAZY LOADING ASSISTIDO
    const scrollToMonth = async (year: number, month: number) => {
        isScrollingManuallyRef.current = true;
        setSelectedYear(year);
        setSelectedMonth(month);

        // Verifica se o bloco correspondente ao mês/ano escolhido já existe fisicamente no DOM
        const targetId = `month-card-${year}-${month}`;
        const element = document.getElementById(targetId);

        if (element && scrollContainerRef.current) {
            // 🚀 CENÁRIO A: Já renderizado na fita! Desliza com suavidade elástica na hora
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setTimeout(() => {
                isScrollingManuallyRef.current = false;
            }, 600);
        } else {
            // ⏳ CENÁRIO B: Salto longo fora do buffer! Dispara a tela de loading corporativa
            setIsEngineLoading(true);

            // Amortece o estado em 650ms para dar tempo do Framer Motion e das transições renderizarem
            await new Promise(resolve => setTimeout(resolve, 650));

            // Re-centra o pivô do tempo no ano/mês do salto e reseta os buffers para o padrão inicial (6 meses)
            setPivotDate(new Date(year, month, 1));
            setPastBuffer(6);
            setFutureBuffer(6);
            setIsEngineLoading(false);

            // Aguarda a injeção do novo DOM e força a ancoragem no pixel zero do novo pivô instantaneamente
            setTimeout(() => {
                const newElement = document.getElementById(`month-card-${year}-${month}`);
                if (newElement && scrollContainerRef.current) {
                    newElement.scrollIntoView({ behavior: 'auto', block: 'start' });
                }
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

    const getDayClasses = (dayDate: Date) => {
        const time = dayDate.getTime();
        const startTime = rangeStart?.getTime();
        const endTime = rangeEnd?.getTime();

        if (startTime && time === startTime) return 'bg-indigo-600 text-white rounded-xl font-black scale-102';
        if (endTime && time === endTime) return 'bg-indigo-600 text-white rounded-xl font-black scale-102';
        if (startTime && endTime && time > startTime && time < endTime) return 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-100/50';
        return 'bg-slate-50/50 hover:bg-slate-100 text-slate-700 border border-transparent';
    };

    const renderMonthGrid = (baseMonth: Date) => {
        const year = baseMonth.getFullYear();
        const month = baseMonth.getMonth();
        const firstDayIndex = new Date(year, month, 1).getDay();
        const totalDays = new Date(year, month + 1, 0).getDate();

        const monthName = baseMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
        const dayCells = [];

        for (let i = 0; i < firstDayIndex; i++) {
            dayCells.push(<div key={`empty-${month}-${i}`} className="h-12 w-full" />);
        }

        for (let day = 1; day <= totalDays; day++) {
            const currentDayDate = new Date(year, month, day);
            const dayKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayCounts = appointmentsCountByDay[dayKey] || { completed: 0, pending: 0, canceled: 0 };

            dayCells.push(
                <button
                    key={`day-${month}-${day}`}
                    type="button"
                    onClick={() => handleDayClick(currentDayDate)}
                    className={`h-12 w-full relative flex items-center justify-center text-xs font-semibold font-mono tabular-nums transition-all cursor-pointer rounded-xl select-none ${getDayClasses(currentDayDate)}`}
                >
                    {/* O número do dia agora fica centralizado no meio exato do card */}
                    <span>{day}</span>

                    {/* 🧭 ✨ FILEIRA DE STATUS: Fixada no topo direito, alinhando os elementos da direita para a esquerda */}
                    <div className="absolute top-1 right-1 flex flex-row-reverse gap-0.5 max-w-[80%] items-center justify-start pointer-events-none">

                        {/* 🟢 BOLINHA VERDE: Concluídos */}
                        {dayCounts.completed > 0 && (
                            <span className="w-3.5 h-3.5 bg-emerald-500 text-white text-[7.5px] font-black rounded-full flex items-center justify-center scale-85 border border-emerald-600/10 shadow-3xs animate-fadeIn shrink-0">
                                {dayCounts.completed}
                            </span>
                        )}

                        {/* 🟣 BOLINHA ROXA: Pendentes / Agendados */}
                        {dayCounts.pending > 0 && (
                            <span className="w-3.5 h-3.5 bg-indigo-500 text-white text-[7.5px] font-black rounded-full flex items-center justify-center scale-85 border border-indigo-600/10 shadow-3xs animate-fadeIn shrink-0">
                                {dayCounts.pending}
                            </span>
                        )}

                        {/* 🔴 BOLINHA VERMELHA: Cancelados */}
                        {dayCounts.canceled > 0 && (
                            <span className="w-3.5 h-3.5 bg-rose-500 text-white text-[7.5px] font-black rounded-full flex items-center justify-center scale-85 border border-rose-600/10 shadow-3xs animate-fadeIn shrink-0">
                                {dayCounts.canceled}
                            </span>
                        )}

                    </div>
                </button>
            );
        }

        return (
            <div
                key={`month-section-${year}-${month}`}
                id={`month-card-${year}-${month}`}
                data-month-card
                data-year={year}
                data-month={month}
                className="space-y-3 border-b border-slate-100 pb-6 last:border-none scroll-mt-2 text-center"
            >
                {/* ✨ CORRIGIDO: Adicionado text-center e mx-auto para centralizar o Nome do Mês e o Ano */}
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider text-center capitalize w-full block">
                    {monthName}
                </h3>

                {/* ✨ CORRIGIDO: Removido o cabeçalho interno de dias da semana (D,S,T...) daqui de dentro */}
                <div className="grid grid-cols-7 gap-1 text-center w-full">
                    {dayCells}
                </div>
            </div>
        );
    };

    return (
        <div className="w-full space-y-4 animate-fadeIn text-left">

            {/* 🧭 BARRA SUPERIOR FIXA CONFIGURADA */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 border border-slate-200/60 p-3 rounded-2xl w-full">
                <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap justify-start">
                    <button
                        type="button"
                        onClick={onBack}
                        className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 hover:text-slate-800 rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-3xs"
                    >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span>Voltar</span>
                    </button>

                    <select
                        value={selectedMonth}
                        onChange={(e) => scrollToMonth(selectedYear, parseInt(e.target.value, 10))}
                        className="px-2 py-1 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 text-xs focus:outline-none cursor-pointer shadow-3xs h-[30px]"
                    >
                        {['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'].map((m, idx) => (
                            <option key={`opt-m-${idx}`} value={idx}>{m}</option>
                        ))}
                    </select>

                    <select
                        value={selectedYear}
                        onChange={(e) => scrollToMonth(parseInt(e.target.value, 10), selectedMonth)}
                        className="px-2 py-1 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 text-xs focus:outline-none cursor-pointer shadow-3xs h-[30px]"
                    >
                        {availableYears.map(y => (
                            <option key={`opt-y-${y}`} value={y}>{y}</option>
                        ))}
                    </select>
                </div>

                {rangeStart && rangeEnd && !isEngineLoading && (
                    <button
                        type="button"
                        onClick={() => onSelectRange(rangeStart, rangeEnd)}
                        className="w-full sm:w-auto px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-md shadow-indigo-150"
                    >
                        <span>Agendamentos neste Período</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>

            {/* CONTAINER PRINCIPAL DE CONTEÚDO CONDICIONAL */}
            <div className="w-full bg-white border border-slate-200/80 rounded-2xl shadow-3xs relative h-[62vh] overflow-hidden flex flex-col">

                {/* ✨ NOVO: Cabeçalho Fixo Único dos Dias da Semana (D, S, T, Q, Q, S, S) */}
                {!isEngineLoading && (
                    <div className="grid grid-cols-7 gap-1 text-center w-full bg-slate-50 border-b border-slate-100 py-2 px-5 shrink-0 z-20">
                        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
                            <div key={`fixed-wk-${i}`} className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{d}</div>
                        ))}
                    </div>
                )}

                {isEngineLoading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center space-y-2 bg-white/80 backdrop-blur-xs rounded-2xl animate-fadeIn">
                        <Loader2 className="w-7 h-7 text-indigo-600 animate-spin" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sincronizando Linha do Tempo...</span>
                    </div>
                ) : (
                    /* 🎢 LINHA DO TEMPO CONTÍNUA COM INFINITE SCROLL BINDADO */
                    <div
                        ref={scrollContainerRef}
                        onScroll={handleScrollThreshold}
                        className="w-full h-full p-5 pt-3 space-y-8 overflow-y-auto scrollbar-none scroll-smooth"
                    >
                        {monthsData.map(renderMonthGrid)}
                    </div>
                )}
            </div>

        </div>
    );
}
