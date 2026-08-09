import { useState } from 'react';
import { type Product } from '../../../types/product.ts';
import { useGridGestures } from '../../../hooks/useGridGestures.ts';
import { CustomLogger } from '../../../utils/CustomLogger.ts';
import {
    productsService,
    type ProductOrderPosition,
    type ProductOrderProfile
} from '../services/products.service.ts';

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

    const handleCreateProduct = async (payload: unknown) => {
        CustomLogger.info('[Products] Creating product');

        try {
            const createdProduct = await productsService.create(payload);
            setProducts((current) => [...current, createdProduct].sort((a, b) => a.position - b.position));
            setIsCreateModalOpen(false);
            CustomLogger.info(`[Products] Product created successfully. ID: ${createdProduct.id}`);
        } catch (error: any) {
            CustomLogger.error('[Products] Failed to create product', error);
            alert(`Erro: ${error.response?.data?.error || 'Falha ao salvar produto.'}`);
        }
    };

    const handleUpdateProduct = async (id: string, payload: unknown) => {
        CustomLogger.info(`[Products] Updating product ${id}`);

        try {
            const updatedProduct = await productsService.update(id, payload);
            setProducts((current) => current.map((item) => item.id === id ? updatedProduct : item));
            setIsEditModalOpen(false);
            setSelectedProduct(null);
            CustomLogger.info(`[Products] Product ${id} updated successfully`);
        } catch (error: any) {
            CustomLogger.error(`[Products] Failed to update product ${id}`, error);
            alert(`Erro ao atualizar: ${error.response?.data?.error || 'Falha na rede.'}`);
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
