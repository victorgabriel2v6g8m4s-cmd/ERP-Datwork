import { Calendar, ChevronRight, Pin, Trash2, Edit2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { ERP_THEME } from '../theme/presets.ts';

interface VersionLog {
    id: string;
    versionDate: string;
    snapshotData: string;
    customName?: string | null;
    isPinned?: boolean; // ✨ Flag que impede o expurgo automático no banco
}

interface UniversalVersionTimelineProps {
    loading: boolean;
    versions: VersionLog[];
    activeUpdatedAt: string; // Chave de comparação para saber qual está selecionado
    onSelectVersion: (snapshotJson: string) => void;
    onRenameVersion: (id: string, currentName: string) => void;
    onTogglePinVersion: (id: string, isPinned: boolean) => void;
    onDeleteVersion: (id: string) => void;
}

export function UniversalVersionTimeline({
    loading, versions, activeUpdatedAt, onSelectVersion, onRenameVersion, onTogglePinVersion, onDeleteVersion
}: UniversalVersionTimelineProps) {
    return (
        <div className="border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-4 space-y-3 font-sans w-full block">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1 select-none">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" /> Linha do Tempo & Histórico
            </h4>

            {loading ? (
                <div className="flex items-center justify-center py-10 gap-2 text-slate-400 font-bold text-xs uppercase tracking-wider animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                    <span>Sincronizando Logs...</span>
                </div>
            ) : (
                <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1 divide-y divide-slate-50 scrollbar-none w-full block">
                    {versions.map((v, index) => {
                        const snapshot = JSON.parse(v.snapshotData);
                        const isCurrentSelected = activeUpdatedAt === snapshot.updatedAt;

                        return (
                            <div
                                key={v.id || `version-${index}`}
                                className={`group/item flex flex-col p-2.5 rounded-2xl border transition-all relative ${isCurrentSelected ? ERP_THEME.timeline.active : ERP_THEME.timeline.inactive
                                    }`}
                            >
                                {/* Área de Clique Principal (Selecionar Versão) */}
                                <div
                                    onClick={() => onSelectVersion(v.snapshotData)}
                                    className="flex items-center justify-between cursor-pointer w-full"
                                >
                                    <div className="truncate pr-2">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[9px] font-black tracking-wide uppercase opacity-75">
                                                {v.customName || `Log V${versions.length - index}`}
                                            </span>
                                            {v.isPinned && (
                                                <span className={ERP_THEME.timeline.pinnedBadge}>
                                                    <Pin className="w-2.5 h-2.5 fill-current" /> Salvo
                                                </span>
                                            )}
                                        </div>
                                        <div className="font-mono text-[10px] tabular-nums mt-1 opacity-90">
                                            {new Date(v.versionDate).toLocaleString('pt-BR', {
                                                day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 opacity-40 group-hover/item:translate-x-0.5 transition-transform" />
                                </div>

                                {/* 🛠️ BARRA DE GOVERNANÇA INTEGRADA (Aparece em hover ou foco) */}
                                <div className={`flex gap-3 mt-2 pt-2 border-t justify-end transition-all ${isCurrentSelected ? 'border-white/20 text-white' : 'border-slate-100 text-slate-400'
                                    }`}>
                                    {/* Botão A: Renomear */}
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); onRenameVersion(v.id, v.customName || `Log V${versions.length - index}`); }}
                                        className="hover:scale-110 active:scale-95 cursor-pointer transition-transform flex items-center gap-1 text-[10px] font-bold"
                                    >
                                        <Edit2 className="w-3 h-3" /> <span>Nome</span>
                                    </button>

                                    {/* Botão B: Fixar / Salvar Definitivamente */}
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); onTogglePinVersion(v.id, !v.isPinned); }}
                                        className={`hover:scale-110 active:scale-95 cursor-pointer transition-transform flex items-center gap-1 text-[10px] font-bold ${v.isPinned ? 'text-amber-500 font-black' : ''
                                            }`}
                                    >
                                        <Pin className={`w-3 h-3 ${v.isPinned ? 'fill-current' : ''}`} />
                                        <span>{v.isPinned ? 'Desfixar' : 'Fixar'}</span>
                                    </button>

                                    {/* Botão C: Apagar Snapshot */}
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); onDeleteVersion(v.id); }}
                                        className="hover:text-red-500 hover:scale-110 active:scale-95 cursor-pointer transition-transform flex items-center gap-1 text-[10px] font-bold"
                                    >
                                        <Trash2 className="w-3 h-3" /> <span>Apagar</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })}

                    {versions.length === 0 && (
                        <div className="p-4 text-center text-slate-400 font-bold text-xs uppercase tracking-wider bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            Nenhum histórico registrado.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
