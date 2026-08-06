import { useState } from 'react';
import { api } from '../api/client.ts';

interface GridGesturesOptions<T> {
    endpoint: string;                      // Rota base do Node (Ex: '/appointments', '/products')
    currentList: T[];                      // Array de dados ativo da tela
    setListState: (list: T[]) => void;     // Modificador de estado do React do componente pai
    onRefresh: () => Promise<void> | void; // Callback síncrono para recarregar a tela pós-gravação
}

export function useGridGestures<T extends { id: string; status: string; position?: number }>({
    endpoint,
    currentList,
    setListState,
    onRefresh
}: GridGesturesOptions<T>) {

    // ✨ Nome genérico e unificado para qualquer registro do ERP
    const [activeItem, setActiveItem] = useState<T | null>(null);

    // Gatilhos Universais de Modais compartilhados
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [viewModalOpen, setViewModalOpen] = useState(false);

    // ==========================================
    // 🧰 CATÁLOGO DE AÇÕES PRONTAS E SELADAS (AGNÓSTICAS)
    // ==========================================

    // 🔃 AÇÃO A: Reordenação Mecânica Vertical por Arraste
    const handleDragEnd = async (result: any) => {
        const { destination, source } = result;
        if (!destination || destination.index === source.index) return;

        const items = Array.from(currentList);
        const [removed] = items.splice(source.index, 1);
        items.splice(destination.index, 0, removed);

        const updatedList = currentList.map((item) => {
            const newIndex = items.findIndex((i) => i.id === item.id);
            if (newIndex !== -1) return { ...item, position: newIndex };
            return item;
        }).sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0));

        setListState(updatedList);

        try {
            const savePromises = updatedList.map((item) =>
                api.patch(`${endpoint}/${item.id}/order`, { position: item.position })
            );
            await Promise.all(savePromises);
        } catch {
            onRefresh();
        }
    };

    // 🧠 AÇÃO B: Máquina de Ciclo de Status Dinâmica (Aceita qualquer sequência de strings via parâmetro)
    const cycleStatus = async (itemOrId: T | string, sequence: string[] = ['PENDING', 'COMPLETED'], deleteStatus = 'CANCELED') => {
        const target = typeof itemOrId === 'string' ? currentList.find(i => i.id === itemOrId) : itemOrId;
        if (!target) return;

        let nextStatus = 'PENDING';

        // ➡️ LÓGICA DO SWIPE RIGHT (DESLIZAR PARA A DIREITA):
        if (target.status === 'PENDING' || target.status === 'SCHEDULED') {
            nextStatus = 'COMPLETED'; // Avança agendamento para atendido
        } else if (target.status === 'COMPLETED') {
            /* ✨ ADICIONADO: Se já estiver concluído e arrastar para a direita, desmarca e volta para PENDENTE */
            nextStatus = 'PENDING';
        } else if (target.status === deleteStatus || target.status === 'INACTIVE') {
            nextStatus = 'PENDING'; // Reativa item cancelado jogando de volta para agendado
        } else {
            return;
        }

        setListState(currentList.map(i => i.id === target.id ? { ...i, status: nextStatus } : i));
        try {
            await api.patch(`${endpoint}/${target.id}/status`, { status: nextStatus });
            onRefresh();
        } catch { onRefresh(); }
    };

    // 🚨 AÇÃO C: Disparador de Popup de Confirmação para Soft-Delete / Cancelamento
    const triggerSoftDelete = async (item: T) => {
        // ⬅️ LÓGICA DO SWIPE LEFT (DESLIZAR PARA A ESQUERDA):
        if (item.status === 'PENDING' || item.status === 'SCHEDULED' || item.status === 'ACTIVE') {
            // Se está agendado e arrasta para a esquerda, aciona o popup para virar CANCELADO por segurança
            setActiveItem(item);
            setConfirmModalOpen(true);
        } else if (item.status === 'COMPLETED') {
            // Se já estava concluído e arrasta para a esquerda, desmarca o atendimento e volta para PENDENTE direto
            setListState(currentList.map(i => i.id === item.id ? { ...i, status: 'PENDING' } : i));
            try {
                await api.patch(`${endpoint}/${item.id}/status`, { status: 'PENDING' });
                onRefresh();
            } catch { onRefresh(); }
        } else if (item.status === 'CANCELED') {
            // Se o item já está cancelado e arrasta para a esquerda, ele faz o fluxo inverso de descancelar
            setListState(currentList.map(i => i.id === item.id ? { ...i, status: 'PENDING' } : i));
            try {
                await api.patch(`${endpoint}/${item.id}/status`, { status: 'PENDING' });
                onRefresh();
            } catch { onRefresh(); }
        }
    };

    // 📝 AÇÃO D: Executador do Soft-Delete no Banco (Gatilho do botão "Confirmar" do modal)
    const executeConfirmDelete = async (deleteStatusTarget = 'CANCELED') => {
        if (!activeItem) return;
        const { id } = activeItem;

        setListState(currentList.map(i => i.id === id ? { ...i, status: deleteStatusTarget } : i));
        setConfirmModalOpen(false);

        try {
            await api.delete(`${endpoint}/${id}`);
            onRefresh();
        } catch {
            onRefresh();
        } finally {
            setActiveItem(null);
        }
    };

    // 📂 AÇÃO E: Abertura imediata do modal de Edição Avançada
    const openEditModal = (itemOrId: T | string) => {
        const target = typeof itemOrId === 'string' ? currentList.find(i => i.id === itemOrId) : itemOrId;
        if (target) {
            setActiveItem(target);
            setEditModalOpen(true);
        }
    };

    // 👁️ AÇÃO F: Abertura imediata do modal de Visualização Detalhada
    const openViewModal = (item: T) => {
        setActiveItem(item);
        setViewModalOpen(true);
    };

    const updateSubStatus = async (id: string, nextSub: string) => {
        // Altera na memória local imediatamente para ganho de feedback tátil e instantâneo
        setListState(currentList.map(item => item.id === id ? { ...item, subStatus: nextSub } : item));

        try {
            await api.patch(`${endpoint}/${id}/sub-status`, { subStatus: nextSub });
            onRefresh();
        } catch {
            onRefresh(); // Reverte em caso de falha de rede
        }
    };

    return {
        activeItem, setActiveItem,
        confirmModalOpen, setConfirmModalOpen,
        editModalOpen, setEditModalOpen,
        viewModalOpen, setViewModalOpen,

        // 🎁 COMPONENTES EXECUTORES PRONTOS ENVIADOS PARA A PÁGINA
        actions: {
            handleDragEnd,
            cycleStatus,
            triggerSoftDelete,
            executeConfirmDelete,
            openEditModal,
            openViewModal,
            updateSubStatus
        }
    };
}
