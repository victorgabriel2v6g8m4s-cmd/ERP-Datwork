import { api } from '../../../api/client.ts';
import { type Product } from '../../../types/product.ts';
import { CustomLogger } from '../../../utils/CustomLogger.ts';
import { type ProductMutationPayload, type ProductVersion } from '../types/product-form.types.ts';

export interface ProductOrderPosition {
    id: string;
    position: number;
}

export interface ProductOrderProfile {
    id: string;
    name: string;
    positions: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function parseProductOrderPositions(value: unknown): ProductOrderPosition[] {
    let parsedValue = value;

    if (typeof value === 'string') {
        try {
            parsedValue = JSON.parse(value) as unknown;
        } catch (error) {
            CustomLogger.warn('[Products] Invalid serialized order profile positions received from API', error);
            return [];
        }
    }

    if (!Array.isArray(parsedValue)) {
        if (parsedValue !== null && parsedValue !== undefined) {
            CustomLogger.warn('[Products] Invalid order profile positions structure received from API');
        }
        return [];
    }

    const uniqueIds = new Set<string>();
    const positions: ProductOrderPosition[] = [];

    for (const entry of parsedValue) {
        if (!isRecord(entry)) continue;

        const id = typeof entry.id === 'string' ? entry.id.trim() : '';
        const position = typeof entry.position === 'number'
            ? entry.position
            : Number(entry.position);

        if (!id || !Number.isInteger(position) || position < 0 || uniqueIds.has(id)) {
            continue;
        }

        uniqueIds.add(id);
        positions.push({ id, position });
    }

    return positions;
}

function normalizeOrderProfile(profile: unknown): ProductOrderProfile | null {
    if (!isRecord(profile)) {
        CustomLogger.warn('[Products] Invalid order profile record received from API');
        return null;
    }

    const id = typeof profile.id === 'string' ? profile.id.trim() : '';
    if (!id) {
        CustomLogger.warn('[Products] Order profile ignored because its identifier is invalid');
        return null;
    }

    const name = typeof profile.name === 'string' ? profile.name.trim() : '';
    const positions = parseProductOrderPositions(profile.positions);

    return {
        id,
        name,
        positions: JSON.stringify(positions)
    };
}

function normalizeProductVersion(version: unknown): ProductVersion | null {
    if (!isRecord(version)) return null;

    const id = typeof version.id === 'string' ? version.id.trim() : '';
    const versionDate = typeof version.versionDate === 'string' ? version.versionDate : '';

    if (!id || !versionDate || !('snapshotData' in version)) {
        return null;
    }

    return {
        id,
        versionDate,
        snapshotData: version.snapshotData
    };
}

export const productsService = {
    async list(): Promise<Product[]> {
        const response = await api.get<Product[]>('/products');
        return response.data;
    },

    async create(payload: ProductMutationPayload): Promise<Product> {
        const response = await api.post<Product>('/products', payload);
        return response.data;
    },

    async update(id: string, payload: ProductMutationPayload): Promise<Product> {
        const response = await api.put<Product>(`/products/${id}`, payload);
        return response.data;
    },

    async listVersions(productId: string): Promise<ProductVersion[]> {
        const response = await api.get<unknown>(`/products/${productId}/versions`);

        if (!Array.isArray(response.data)) {
            CustomLogger.warn(`[Products] Invalid version history response for product ${productId}`);
            return [];
        }

        return response.data
            .map(normalizeProductVersion)
            .filter((version): version is ProductVersion => version !== null);
    },

    async listOrderProfiles(): Promise<ProductOrderProfile[]> {
        const response = await api.get<unknown[]>('/products/orders');

        return response.data
            .map(normalizeOrderProfile)
            .filter((profile): profile is ProductOrderProfile => profile !== null);
    },

    async createOrderProfile(name: string, positions: ProductOrderPosition[]): Promise<void> {
        await api.post('/products/orders', { name, positions });
    },

    async renameOrderProfile(id: string, name: string): Promise<void> {
        await api.put(`/products/orders/${id}`, { name });
    },

    async deleteOrderProfile(id: string): Promise<void> {
        await api.delete(`/products/orders/${id}`);
    }
};
