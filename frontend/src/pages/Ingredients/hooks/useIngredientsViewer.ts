import { useState, useEffect } from 'react';
import { api } from '../../../api/client.ts';
import { type Ingredient } from '../../../types/ingredient.ts';
import { type MediaItem } from '../../../types/appointment.ts';
import { CustomLogger } from '../../../utils/CustomLogger.ts';

interface UseIngredientsViewerProps {
    isOpen: boolean;
    ingredient: Ingredient | null;
}

export function useIngredientsViewer({ isOpen, ingredient }: UseIngredientsViewerProps) {
    const [versions, setVersions] = useState<any[]>([]);
    const [activeData, setActiveData] = useState<Ingredient | null>(null);
    const [loading, setLoading] = useState(false);

    const [medias, setMedias] = useState<MediaItem[]>([]);
    const [activeMedia, setActiveMedia] = useState<MediaItem | null>(null);

    // 📡 Busca histórico de alterações físicas do insumo
    const fetchVersions = async (id: string) => {
        setLoading(true);
        try {
            const response = await api.get(`/products/${id}/versions`);
            setVersions(response.data);
        } catch (error) {
            CustomLogger.error(`[Insumo Viewer] Falha ao carregar histórico da ID ${id}`, error);
            setVersions([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && ingredient) {
            CustomLogger.info(`[Insumo Viewer] Inicializando resumo analítico. ID: ${ingredient.id}`);
            setActiveData(ingredient);

            // 🛡️ Blindagem contra o tipo Json nativo do Prisma
            try {
                const rawMedias = (ingredient as any).medias;
                if (rawMedias) {
                    const parsed = typeof rawMedias === 'string' ? JSON.parse(rawMedias) : rawMedias;
                    setMedias(Array.isArray(parsed)
                        ? parsed.filter(m => m).map((m, idx) => ({
                            ...m,
                            id: m.id?.trim() ? m.id : `media-init-${idx}`
                        }))
                        : []
                    );
                } else {
                    setMedias([]);
                }
            } catch {
                setMedias([]);
            }

            fetchVersions(ingredient.id);
        }
    }, [isOpen, ingredient]);

    const handleSelectVersion = (snapshotJson: string) => {
        try {
            const historical = JSON.parse(snapshotJson);
            setActiveData(historical);
            CustomLogger.info(`[Insumo Viewer] Carregando snapshot histórico na tela. Data Modificação: ${historical.updatedAt}`);

            if (historical.medias) {
                const parsed = typeof historical.medias === 'string' ? JSON.parse(historical.medias) : historical.medias;
                setMedias(Array.isArray(parsed)
                    ? parsed.filter(m => m).map((m, idx) => ({
                        ...m,
                        id: m.id?.trim() ? m.id : `media-hist-${idx}`
                    }))
                    : []
                );
            } else {
                setMedias([]);
            }
        } catch (error) {
            CustomLogger.error('[Insumo Viewer] Erro crítico ao processar string JSON histórica', error);
            setMedias([]);
        }
    };

    const handleRenameVersion = async (versionId: string, currentName: string) => {
        const newName = window.prompt('Insira um nome personalizado para este marco histórico:', currentName);
        if (newName === null || newName.trim() === '') return;

        try {
            await api.patch(`/versions/${versionId}/rename`, { customName: newName.trim() });
            CustomLogger.info(`[Viewer] Snapshot ${versionId} renomeado para: "${newName}"`);
            if (ingredient) fetchVersions(ingredient.id); // Recarrega a fita
        } catch (error) {
            CustomLogger.error('Falha ao renomear registro histórico', error);
        }
    };

    const handleTogglePinVersion = async (versionId: string, isPinned: boolean) => {
        try {
            await api.patch(`/versions/${versionId}/pin`, { isPinned });
            CustomLogger.info(`[Viewer] Estado de fixação do snapshot ${versionId} alterado para: ${isPinned}`);
            if (ingredient) fetchVersions(ingredient.id);
        } catch (error) {
            CustomLogger.error('Falha ao alterar flag de salvamento definitivo', error);
        }
    };

    const handleDeleteVersion = async (versionId: string) => {
        if (!window.confirm('Deseja apagar permanentemente este registro de auditoria? Esta ação não pode ser desfeita.')) return;

        try {
            await api.delete(`/versions/${versionId}`);
            CustomLogger.info(`[Viewer] Snapshot ${versionId} deletado fisicamente do banco.`);
            if (ingredient) fetchVersions(ingredient.id);
        } catch (error) {
            CustomLogger.error('Falha ao expurgar snapshot do histórico', error);
        }
    };

    return {
        versions, activeData, loading, medias, activeMedia, setActiveMedia, handleSelectVersion, handleDeleteVersion, handleRenameVersion, handleTogglePinVersion
    };
}
