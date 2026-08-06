import { type ReactNode } from 'react';

export interface GridColumn<T> {
    header: string;
    gridRatio: string;
    textAlign?: 'left' | 'center' | 'right';
    render?: (row: T, index: number) => ReactNode; // Opcional para listas de gestos
}

interface UniversalGridTableProps<T> {
    columns: GridColumn<T>[];
    data: T[];
    emptyMessage?: string;
    // ✨ NOVO: Sinaliza se a lista usa o motor de gestos e arrasto tátil (Drag/Swipe)
    isDraggableList?: boolean;
    renderDraggableRow?: (row: T, index: number) => ReactNode; // Função que injeta o UniversalRowItem
}

export function UniversalGridTable<T>({
    columns,
    data,
    emptyMessage = 'Nenhum registro encontrado.',
    isDraggableList = false,
    renderDraggableRow
}: UniversalGridTableProps<T>) {

    const gridTemplateColumns = columns.map(col => col.gridRatio).join('_');

    const getTextAlignClass = (align?: 'left' | 'center' | 'right') => {
        if (align === 'center') return 'text-center justify-center';
        if (align === 'right') return 'text-right justify-end';
        return 'text-left justify-start';
    };

    return (
        <div className="w-full bg-white border border-slate-200/80 rounded-2xl shadow-3xs overflow-hidden mx-auto select-none">
            <div className="overflow-x-auto w-full scrollbar-none">
                {/* Mantém a sincronia de larguras do cabeçalho com o corpo */}
                <div className="w-full min-w-[768px] block">

                    {/* 1. CABEÇALHO UNIFICADO CENTRALIZADO */}
                    <div
                        style={{ gridTemplateColumns: gridTemplateColumns.replace(/_/g, ' ') }}
                        className="bg-slate-50 border-b border-slate-200 text-slate-500 font-black uppercase tracking-wider text-[10px] grid items-center py-3 w-full"
                    >
                        {columns.map((col, idx) => (
                            <div key={`head-col-${idx}`} className={`px-4 flex items-center h-full ${getTextAlignClass(col.textAlign)}`}>
                                {col.header}
                            </div>
                        ))}
                    </div>

                    {/* 2. CORPO DA PLANILHA CONDICIONAL */}
                    {isDraggableList && renderDraggableRow ? (
                        /* ✨ SE FOR LISTA DE GESTOS: Deixa o DragDropContext e o UniversalRowItem controlarem o bloco */
                        <div className="block w-full bg-white">
                            {data.map((row, rowIndex) => renderDraggableRow(row, rowIndex))}
                        </div>
                    ) : (
                        /* SE FOR PLANILHA TRADICIONAL (Como a de Precificação de Produtos) */
                        <div className="divide-y divide-slate-100 block w-full bg-white">
                            {data.map((row, rowIndex) => (
                                <div
                                    key={`row-${rowIndex}`}
                                    style={{ gridTemplateColumns: gridTemplateColumns.replace(/_/g, ' ') }}
                                    className="grid items-center py-2.5 hover:bg-slate-50/50 w-full transition-colors font-medium text-slate-700 text-xs sm:text-sm"
                                >
                                    {columns.map((col, colIdx) => (
                                        <div key={`cell-${rowIndex}-${colIdx}`} className={`px-4 flex items-center min-w-0 ${getTextAlignClass(col.textAlign)}`}>
                                            {col.render ? col.render(row, rowIndex) : null}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    )}

                    {data.length === 0 && (
                        <div className="text-center py-12 text-slate-400 font-bold text-xs uppercase tracking-wider block w-full bg-white">
                            {emptyMessage}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
