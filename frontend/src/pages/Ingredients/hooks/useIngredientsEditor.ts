import { useState, useEffect } from 'react';
import { api } from '../../../api/client.ts';
import { executeBinaryUpload } from '../../../utils/uploadService.ts';
import { type Ingredient } from '../../../types/ingredient.ts';
import { type MediaItem } from '../../../types/appointment.ts';
import { CustomLogger } from '../../../utils/CustomLogger.ts';

interface UseIngredientsEditorProps {
    isOpen: boolean;
    ingredient: Ingredient | null;
    onClose: () => void;
    onSave: (id: string, payload: any) => Promise<void>;
}

export function useIngredientsEditor({ isOpen, ingredient, onClose, onSave }: UseIngredientsEditorProps) {
    const [openSection, setOpenSection] = useState<'id' | 'metrics' | 'media' | null>('id');

    // Estados locais sincronizados de Insumos
    const [sku, setSku] = useState('');
    const [name, setName] = useState('');
    const [price, setPrice] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [unit, setUnit] = useState('Unidades');

    // Estados de mídias e fotos anexadas
    const [thumbnail, setThumbnail] = useState<string | null>(null);
    const [medias, setMedias] = useState<MediaItem[]>([]);
    const [activeMedia, setActiveMedia] = useState<MediaItem | null>(null);

    // Estados inertes exigidos pelo StepIdentification universal
    const [brand, setBrand] = useState('');
    const [variation, setVariation] = useState('');
    const [description, setDescription] = useState('');

    // 🛡️ INICIALIZAÇÃO SEGURA CONTRA CONGELAMENTO DE JSON (PRISMA NATÍVO)
    useEffect(() => {
        if (ingredient && isOpen) {
            CustomLogger.info(`[Insumo Editor] Sincronizando dados para alteração cadastral. ID: ${ingredient.id}`);
            setSku(ingredient.sku);
            setName(ingredient.name);
            setPrice(ingredient.price);
            setQuantity(ingredient.quantity);
            setUnit(ingredient.unit);
            setThumbnail(ingredient.thumbnail || null);

            // Checagem defensiva contra o tipo de dado JSON vindo das tabelas do Prisma
            try {
                const rawMedias = (ingredient as any).medias;
                if (rawMedias) {
                    const parsed = typeof rawMedias === 'string' ? JSON.parse(rawMedias) : rawMedias;
                    setMedias(Array.isArray(parsed) ? parsed.filter(m => m && m.id) : []);
                } else {
                    setMedias([]);
                }
            } catch (error) {
                CustomLogger.warn('[Insumo Editor] Erro de parsing em mídias corrompidas. Reseta para vazio.');
                setMedias([]);
            }

            setOpenSection('id');
        }
    }, [ingredient, isOpen]);

    const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        // Consome a inteligência centralizada em uma única linha assíncrona limpa!
        const uploadedUrl = await executeBinaryUpload(e.target.files[0]);
        if (uploadedUrl) {
            setThumbnail(uploadedUrl);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!ingredient || !sku.trim() || !name.trim()) return;

        CustomLogger.info(`[Insumo Editor] Disparando Axios PUT para salvar insumo ID: ${ingredient.id}`);

        // ✨ CORREÇÃO CRÍTICA: Envia o array de mídias estruturado puro para o JSON do Prisma, sem stringify!
        await onSave(ingredient.id, {
            sku: sku.trim().toUpperCase(),
            name: name.trim(),
            price: Number(price),
            quantity: Number(quantity),
            unit,
            thumbnail,
            medias: medias.length > 0 ? medias : null
        });

        onClose();
    };

    return {
        openSection, setOpenSection, sku, setSku, name, setName, price, setPrice, quantity, setQuantity,
        unit, setUnit, thumbnail, setThumbnail, medias, setMedias, activeMedia, setActiveMedia,
        brand, setBrand, variation, setVariation, description, setDescription, handleThumbnailUpload, handleSubmit
    };
}
