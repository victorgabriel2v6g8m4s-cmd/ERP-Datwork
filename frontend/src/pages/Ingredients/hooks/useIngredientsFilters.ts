import { useState, useMemo } from 'react';
import { type Ingredient } from '../../../types/ingredient.ts';
import { type UniversalFilters } from '../../../components/index.ts';
import { CustomLogger } from '../../../utils/CustomLogger.ts';

export function useIngredientsFilters(ingredients: Ingredient[], orderProfiles: any[]) {
    const [activeFilters, setActiveFilters] = useState<UniversalFilters>({
        search: '',
        sortBy: 'custom',
        abcCategory: 'all',
        unitFilter: 'all',
    });

    // 🧮 CÁLCULO DE MÉTRICAS ANALÍTICAS REATIVAS
    const metrics = useMemo(() => {
        const activeItens = ingredients.filter(i => i.status === 'ACTIVE');
        const totalCount = activeItens.length;
        const averageCost = totalCount > 0
            ? activeItens.reduce((acc, i) => acc + (Number(i.price) || 0), 0) / totalCount
            : 0;

        return { totalIngredientsCount: totalCount, averagePrice: averageCost };
    }, [ingredients]);

    // 🧠 MOTOR REATIVO DE FILTRAGEM E ORDENAÇÃO DE ALMOXARIFADO
    const filteredIngredients = useMemo(() => {
        CustomLogger.info(`[Filtro Debug] Iniciando varredura. Total na memória: ${ingredients.length} itens.`);

        let result = ingredients.filter((item) => {
            // 🕵️ LOG DE RASTREAMENTO: Imprime o estado de cada item que tenta entrar na tabela
            CustomLogger.info(`[Filtro Debug] Avaliando Item: ${item.name} | SKU: ${item.sku} | Status Atual: "${item.status}"`);

            if (activeFilters.unitFilter !== 'all' && item.unit !== activeFilters.unitFilter) {
                return false;
            }

            if (activeFilters.search) {
                const searchLower = activeFilters.search.toLowerCase();
                const matchesSku = (item.sku || '').toLowerCase().includes(searchLower);
                const matchesName = (item.name || '').toLowerCase().includes(searchLower);
                if (!matchesSku && !matchesName) return false;
            }

            return true;
        });

        CustomLogger.info(`[Filtro Debug] Varredura concluída. Exibindo ${result.length} linhas na tela.`);

        // Mantém o restante das ordenações por perfil...
        if (activeFilters.sortBy.startsWith('profile-')) {
            const profileId = activeFilters.sortBy.replace('profile-', '');
            const activeProfile = orderProfiles.find(p => p.id === profileId);
            if (activeProfile) {
                const positionsMap: any[] = JSON.parse(activeProfile.positions);
                return result.sort((a, b) => {
                    const posA = positionsMap.find(p => p.id === a.id)?.position ?? 999;
                    const posB = positionsMap.find(p => p.id === b.id)?.position ?? 999;
                    return posA - posB;
                });
            }
        }

        return result.sort((a, b) => {
            if (activeFilters.sortBy === 'az') return a.name.localeCompare(b.name);
            if (activeFilters.sortBy === 'date') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            if (activeFilters.sortBy === 'value') return (b.price || 0) - (a.price || 0);
            return (a.position || 0) - (b.position || 0);
        });
    }, [ingredients, activeFilters, orderProfiles]);

    const handleApplyProfilePositions = (positionsMap: any[]) => {
        return [...ingredients].sort((a, b) => {
            const posA = positionsMap.find(p => p.id === a.id)?.position ?? 999;
            const posB = positionsMap.find(p => p.id === b.id)?.position ?? 999;
            return posA - posB;
        }).map((ing, index) => ({ ...ing, position: index }));
    };

    return {
        activeFilters,
        setActiveFilters,
        filteredIngredients,
        handleApplyProfilePositions,
        ...metrics
    };
}
