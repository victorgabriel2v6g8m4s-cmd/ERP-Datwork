import { useMemo, useState } from 'react';
import { type Product } from '../../../types/product.ts';
import { type UniversalFilters } from '../../../components/index.ts';
import { CustomLogger } from '../../../utils/CustomLogger.ts';
import { PRODUCT_DEFAULT_FILTERS } from '../constants/products.constants.ts';
import { type ProductOrderProfile, type ProductOrderPosition } from '../services/products.service.ts';

export function useProductsFilters(products: Product[], orderProfiles: ProductOrderProfile[]) {
    const [activeFilters, setActiveFilters] = useState<UniversalFilters>({ ...PRODUCT_DEFAULT_FILTERS });

    const metrics = useMemo(() => {
        const activeProducts = products.filter((product) => product.status === 'ACTIVE');
        const totalUnitCost = activeProducts.reduce((sum, product) => sum + (Number(product.totalUnitCost) || 0), 0);

        return {
            totalProductsCount: products.length,
            activeProductsCount: activeProducts.length,
            averageUnitCost: activeProducts.length > 0 ? totalUnitCost / activeProducts.length : 0
        };
    }, [products]);

    const filteredProducts = useMemo(() => {
        const searchTerm = activeFilters.search.trim().toLowerCase();

        const result = products.filter((item) => {
            if (searchTerm) {
                const matchesSearch = [item.sku, item.name, item.brand]
                    .filter(Boolean)
                    .some((value) => String(value).toLowerCase().includes(searchTerm));

                if (!matchesSearch) return false;
            }

            if (activeFilters.abcCategory !== 'all' && item.abcCategory !== activeFilters.abcCategory) {
                return false;
            }

            return true;
        });

        if (activeFilters.sortBy.startsWith('profile-')) {
            const profileId = activeFilters.sortBy.replace('profile-', '');
            const profile = orderProfiles.find((item) => item.id === profileId);

            if (profile) {
                try {
                    const positions = JSON.parse(profile.positions) as ProductOrderPosition[];
                    const positionsById = new Map(positions.map((position) => [position.id, position.position]));

                    return [...result].sort((a, b) =>
                        (positionsById.get(a.id) ?? Number.MAX_SAFE_INTEGER) -
                        (positionsById.get(b.id) ?? Number.MAX_SAFE_INTEGER)
                    );
                } catch (error) {
                    CustomLogger.error(`[Products] Failed to parse order profile ${profile.id}`, error);
                }
            }
        }

        return [...result].sort((a, b) => {
            if (activeFilters.sortBy === 'az') return a.name.localeCompare(b.name);
            if (activeFilters.sortBy === 'date') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            if (activeFilters.sortBy === 'value') return (b.totalUnitCost || 0) - (a.totalUnitCost || 0);
            return (a.position || 0) - (b.position || 0);
        });
    }, [products, activeFilters, orderProfiles]);

    const applyProfilePositions = (positions: ProductOrderPosition[]) => {
        const positionsById = new Map(positions.map((position) => [position.id, position.position]));

        return [...products]
            .sort((a, b) =>
                (positionsById.get(a.id) ?? Number.MAX_SAFE_INTEGER) -
                (positionsById.get(b.id) ?? Number.MAX_SAFE_INTEGER)
            )
            .map((product, index) => ({ ...product, position: index }));
    };

    return {
        activeFilters,
        setActiveFilters,
        filteredProducts,
        applyProfilePositions,
        ...metrics
    };
}
