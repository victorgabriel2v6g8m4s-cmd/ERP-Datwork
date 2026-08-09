import { api } from '../../../api/client.ts';
import { type Product } from '../../../types/product.ts';

export interface ProductOrderPosition {
    id: string;
    position: number;
}

export interface ProductOrderProfile {
    id: string;
    name: string;
    positions: string;
}

function normalizeOrderProfile(profile: any): ProductOrderProfile {
    return {
        id: String(profile.id),
        name: String(profile.name ?? ''),
        positions: typeof profile.positions === 'string'
            ? profile.positions
            : JSON.stringify(profile.positions ?? [])
    };
}

export const productsService = {
    async list(): Promise<Product[]> {
        const response = await api.get<Product[]>('/products');
        return response.data;
    },

    async create(payload: unknown): Promise<Product> {
        const response = await api.post<Product>('/products', payload);
        return response.data;
    },

    async update(id: string, payload: unknown): Promise<Product> {
        const response = await api.put<Product>(`/products/${id}`, payload);
        return response.data;
    },

    async listOrderProfiles(): Promise<ProductOrderProfile[]> {
        const response = await api.get<any[]>('/products/orders');
        return response.data.map(normalizeOrderProfile);
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
