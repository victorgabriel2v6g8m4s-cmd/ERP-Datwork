import { useState } from 'react';
import { api } from '../../../api/client.ts';
import { type MediaItem } from '../../../types/appointment.ts';
import { CustomLogger } from '../../../utils/CustomLogger.ts';

interface UseIngredientsWizardProps {
    onClose: () => void;
    onSave: (payload: any) => Promise<void>;
}

export function useIngredientsWizard({ onClose, onSave }: UseIngredientsWizardProps) {
    const [step, setStep] = useState(1);

    // 📝 ETAPA 1: Identificação (SKU e Nome)
    const [sku, setSku] = useState('');
    const [name, setName] = useState('');
    const [brand, setBrand] = useState('');
    const [variation, setVariation] = useState('');
    const [description, setDescription] = useState('');

    // 🪙 ETAPA 2: Métricas de Insumos
    const [price, setPrice] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [unit, setUnit] = useState('Unidades');

    // 📁 ETAPA 3: Capa & Galeria de Anexos
    const [thumbnail, setThumbnail] = useState<string | null>(null);
    const [medias, setMedias] = useState<MediaItem[]>([]);
    const [activeMedia, setActiveMedia] = useState<MediaItem | null>(null);

    const progressPercent = ((step - 1) / 2) * 100;

    const handleNextStep = () => {
        if (step === 1 && (!sku.trim() || !name.trim())) return;
        setStep((prev) => Math.min(prev + 1, 3));
    };

    const handlePrevStep = () => {
        setStep((prev) => Math.max(prev - 1, 1));
    };

    const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('file', file);

        CustomLogger.info(`[Insumo Wizard] Iniciando upload de imagem de capa para o arquivo: ${file.name}`);

        try {
            // ✨ CORREÇÃO: Aponta para a rota global e unificada com fileSanitizer nativo
            const response = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setThumbnail(response.data.url);
            CustomLogger.info('[Insumo Wizard] Upload concluído e URL da capa vinculada.');
        } catch (error) {
            CustomLogger.error('Falha crítica ao carregar imagem de capa do insumo', error);
        }
    };

    const handleReset = () => {
        setStep(1);
        setSku(''); setName(''); setBrand(''); setVariation(''); setDescription('');
        setPrice(0); setQuantity(1); setUnit('Unidades'); setThumbnail(null); setMedias([]);
        onClose();
    };

    const handleSubmit = async () => {
        if (!sku.trim() || !name.trim()) return;

        CustomLogger.info(`[Insumo Wizard] Compilando payload estruturado para o SKU: ${sku.toUpperCase()}`);

        // ✨ CORREÇÃO CRÍTICA: Passa o array de mídias puro (Json nativo do Prisma), sem JSON.stringify!
        await onSave({
            sku: sku.trim().toUpperCase(),
            name: name.trim(),
            price: Number(price),
            quantity: Number(quantity),
            unit,
            thumbnail,
            medias: medias.length > 0 ? medias : null
        });

        handleReset();
    };

    return {
        step, setStep, sku, setSku, name, setName, brand, setBrand, variation, setVariation,
        description, setDescription, price, setPrice, quantity, setQuantity, unit, setUnit,
        thumbnail, setThumbnail, medias, setMedias, activeMedia, setActiveMedia, progressPercent,
        handleNextStep, handlePrevStep, handleThumbnailUpload, handleReset, handleSubmit
    };
}
