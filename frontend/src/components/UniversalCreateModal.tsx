// import { useState, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { X, Tags, CheckCircle, ArrowRight, ArrowLeft, Package, Coins, BarChart3, Image as ImageIcon, Layers, FlaskConical } from 'lucide-react';
// import { api } from '../api/client.ts';
// import { maskCurrencyBRL } from '../utils/format.ts';
// import { type MediaItem } from '../types/appointment.ts';
// import { MediaManager } from './MediaManager.tsx';
// import { MediaLightbox } from './MediaLightbox.tsx';

// interface UniversalCreateModalProps {
//   type: 'products' | 'ingredients'; // ✨ Flag polimórfica de comportamento
//   isOpen: boolean;
//   onClose: () => void;
//   onSave: (payload: any) => Promise<void>;
// }

// export function UniversalCreateModal({ type, isOpen, onClose, onSave }: UniversalCreateModalProps) {
//   const isProducts = type === 'products';
  
//   // 🧭 O total de etapas muda sob demanda: 4 para produtos, 2 para insumos
//   const totalSteps = isProducts ? 4 : 2;
//   const [step, setStep] = useState(1);

//   // 📝 ESTADOS COMPARTILHADOS (Apenas SKU e Nome bloqueiam o avanço no Step 1)
//   const [sku, setSku] = useState('');
//   const [name, setName] = useState('');
//   const [brand, setBrand] = useState('');
//   const [variation, setVariation] = useState('');
//   const [description, setDescription] = useState('');

//   // Estados específicos de Finanças e Metragens
//   const [batchCost, setBatchCost] = useState(0);
//   const [unitsPerBatch, setUnitsPerBatch] = useState(1);
//   const [productionCostInput, setProductionCostInput] = useState(0); 
//   const [calculatedProductionCost, setCalculatedProductionCost] = useState(0);
//   const [calculatedTotalUnitCost, setCalculatedTotalUnitCost] = useState(0);
//   const [abcCategory, setAbcCategory] = useState('C');

//   const [salePrice, setSalePrice] = useState(0);
//   const [stockQuantity, setStockQuantity] = useState(0);

//   // Estados específicos de Insumos puros
//   const [price, setPrice] = useState(0);
//   const [quantity, setQuantity] = useState(1);
//   const [unit, setUnit] = useState('Unidades');

//   // Mídias universais recicladas
//   const [thumbnail, setThumbnail] = useState<string | null>(null);
//   const [medias, setMedias] = useState<MediaItem[]>([]);
//   const [activeMedia, setActiveMedia] = useState<MediaItem | null>(null);

//   // 📈 Barra de Progresso Verde Dinâmica adaptada ao número de etapas
//   const progressPercent = ((step - 1) / (totalSteps - 1 || 1)) * 100;

//   // 🧮 Motor de Cálculo Reativo de Lote (Apenas se for contexto de produtos)
//   useEffect(() => {
//     if (isProducts) {
//       const baseUnitCost = batchCost / (unitsPerBatch || 1);
//       setCalculatedProductionCost(baseUnitCost);
//       const totalUnit = baseUnitCost + productionCostInput;
//       setCalculatedTotalUnitCost(totalUnit);

//       if (totalUnit >= 100) setAbcCategory('A');
//       else if (totalUnit >= 30) setAbcCategory('B');
//       else setAbcCategory('C');
//     }
//   }, [batchCost, unitsPerBatch, productionCostInput, isProducts]);

//   const handleNextStep = () => {
//     if (step === 1 && (!sku.trim() || !name.trim())) return; // Trava obrigatória de SKU e Nome
//     setStep((prev) => Math.min(prev + 1, totalSteps));
//   };

//   const handlePrevStep = () => {
//     setStep((prev) => Math.max(prev - 1, 1));
//   };

//   const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (!e.target.files || e.target.files.length === 0) return;
//     const formData = new FormData();
//     formData.append('file', e.target.files[0]);

//     try {
//       // Ambos utilizam o mesmo barramento físico de uploads do Multer
//       const endpoint = isProducts ? '/products/upload' : '/products/upload'; 
//       const response = await api.post(endpoint, formData, {
//         headers: { 'Content-Type': 'multipart/form-data' }
//       });
//       setThumbnail(response.data.url);
//     } catch (error) { console.error('🔥 Upload falhou:', error); }
//   };

//   const handleSubmit = async () => {
//     if (!sku.trim() || !name.trim()) return;

//     const payload = isProducts ? {
//       sku: sku.trim().toUpperCase(),
//       name: name.trim(),
//       brand: brand.trim() || 'Sem Marca',
//       variation: variation.trim() || null,
//       description: description.trim() || null,
//       batchCost, unitsPerBatch, productionCost: productionCostInput, totalUnitCost: calculatedTotalUnitCost, abcCategory,
//       salePrice, stockQuantity, thumbnail, medias: JSON.stringify(medias)
//     } : {
//       sku: sku.trim().toUpperCase(),
//       name: name.trim(),
//       price, quantity, unit, thumbnail
//     };

//     await onSave(payload);
//     handleReset();
//   };

//   const handleReset = () => {
//     setStep(1); setSku(''); setName(''); setBrand(''); setVariation(''); setDescription('');
//     setBatchCost(0); setUnitsPerBatch(1); setProductionCostInput(0); setSalePrice(0); setStockQuantity(0);
//     setPrice(0); setQuantity(1); setUnit('Unidades'); setThumbnail(null); setMedias([]);
//     onClose();
//   };

//   if (!isOpen) return null;
