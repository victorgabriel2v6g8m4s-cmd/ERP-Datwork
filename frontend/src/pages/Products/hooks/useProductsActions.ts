import { useState } from 'react';
import { TEXTS } from '../../../i18n/index.ts';
import { type Product } from '../../../types/product.ts';
import { useGridGestures } from '../../../hooks/useGridGestures.ts';
import { CustomLogger } from '../../../utils/CustomLogger.ts';
import {
    productsService,
    type ProductOrderPosition,
    type ProductOrderProfile
} from '../services/products.service.ts';
import { type ProductMutationPayload } from '../types/product-form.types.ts';

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getProductApiErrorMessage(error: unknown, fallback: string): string {
    if (!isRecord(error) || !isRecord(error.response) || !isRecord(error.response.data)) {
        return fallback;
    }

    return typeof error.response.data.error === 'string'
        ? error.response.data.error
        : fallback;
}

export function useProductsActions() {
    const [products, setProducts] = useState<Product[]>([]);
    const [orderProfiles, setOrderProfiles] = useState<ProductOrderProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const fetchProducts = async () => {
        CustomLogger.info('[Products] Loading product catalog');

        try {
            const data = await productsService.list();
            setProducts([...data].sort((a, b) => a.position - b.position));
            CustomLogger.info(`[Products] Product catalog loaded with ${data.length} records`);
        } catch (error) {
            CustomLogger.error('[Products] Failed to load product catalog', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchOrderProfiles = async () => {
        CustomLogger.info('[Products] Loading custom order profiles');

        try {
            const data = await productsService.listOrderProfiles();
            setOrderProfiles(data);
            CustomLogger.info(`[Products] Loaded ${data.length} custom order profiles`);
        } catch (error) {
            CustomLogger.error('[Products] Failed to load custom order profiles', error);
        }
    };

    const {
        activeItem: selectedProduct,
        setActiveItem: setSelectedProduct,
        editModalOpen: isEditModalOpen,
        setEditModalOpen: setIsEditModalOpen,
        viewModalOpen: isViewModalOpen,
        setViewModalOpen: setIsViewModalOpen,
        actions
    } = useGridGestures<Product>({
        endpoint: '/products',
        currentList: products,
        setListState: setProducts,
        onRefresh: fetchProducts,
        skipConfirmDelete: true,
        refreshAfterSoftDelete: false
    });

    const handleCreateProduct = async (payload: ProductMutationPayload) => {
        CustomLogger.info('[Products] Creating product');

        try {
            const createdProduct = await productsService.create(payload);
            CustomLogger.info(`[Products] Product created successfully. ID: ${createdProduct.id}`);
            await fetchProducts();
        } catch (error) {
            CustomLogger.error('[Products] Failed to create product', error);
            const message = getProductApiErrorMessage(error, TEXTS.products.errors.createFallback);
            alert(TEXTS.products.errors.create(message));
            throw error;
        }
    };

    const handleUpdateProduct = async (id: string, payload: ProductMutationPayload) => {
        CustomLogger.info(`[Products] Updating product ${id}`);

        try {
            await productsService.update(id, payload);
            CustomLogger.info(`[Products] Product ${id} updated successfully`);
            await fetchProducts();
        } catch (error) {
            CustomLogger.error(`[Products] Failed to update product ${id}`, error);
            const message = getProductApiErrorMessage(error, TEXTS.products.errors.updateFallback);
            alert(TEXTS.products.errors.update(message));
            throw error;
        }
    };

    const handleSaveNewOrderProfile = async (name: string) => {
        const positions: ProductOrderPosition[] = products.map((product, position) => ({
            id: product.id,
            position
        }));

        CustomLogger.info(`[Products] Creating order profile "${name}" with ${positions.length} positions`);

        try {
            await productsService.createOrderProfile(name, positions);
            await fetchOrderProfiles();
        } catch (error) {
            CustomLogger.error('[Products] Failed to create order profile', error);
        }
    };

    const handleRenameOrderProfile = async (id: string, name: string) => {
        CustomLogger.info(`[Products] Renaming order profile ${id}`);

        try {
            await productsService.renameOrderProfile(id, name);
            await fetchOrderProfiles();
        } catch (error) {
            CustomLogger.error(`[Products] Failed to rename order profile ${id}`, error);
        }
    };

    const handleDeleteOrderProfile = async (id: string) => {
        CustomLogger.info(`[Products] Deleting order profile ${id}`);

        try {
            await productsService.deleteOrderProfile(id);
            await fetchOrderProfiles();
        } catch (error) {
            CustomLogger.error(`[Products] Failed to delete order profile ${id}`, error);
        }
    };

    return {
        products,
        setProducts,
        orderProfiles,
        loading,
        isCreateModalOpen,
        setIsCreateModalOpen,
        isEditModalOpen,
        setIsEditModalOpen,
        isViewModalOpen,
        setIsViewModalOpen,
        selectedProduct,
        setSelectedProduct,
        fetchProducts,
        fetchOrderProfiles,
        handleCreateProduct,
        handleUpdateProduct,
        handleSaveNewOrderProfile,
        handleRenameOrderProfile,
        handleDeleteOrderProfile,
        actions
    };
}
