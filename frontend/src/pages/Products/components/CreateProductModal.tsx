import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Tags, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { api } from '../../../api/client.ts';
import { type MediaItem } from '../../../types/appointment.ts';
import { MediaLightbox } from '../../../components/MediaLightbox.tsx';

// ✨ Importação Atômica das 4 Etapas Fatiadas (Clean Code)
import { StepIdentification } from './wizard/StepIdentification.tsx';
import { StepCosts } from './wizard/StepCosts.tsx';
import { StepPricing } from './wizard/StepPricing.tsx';
import { StepMedia } from './wizard/StepMedia.tsx';

interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: any) => Promise<void>;
}

export function CreateProductModal({ isOpen, onClose, onSave }: CreateProductModalProps) {
  // 🧭 Controle de Fluxo do Assistente (Etapas de 1 a 4)
  const [step, setStep] = useState(1);

  // 📝 ESTADOS DA ETAPA 1: Identificação (Únicos obrigatórios: SKU e Nome)
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [variation, setVariation] = useState('');
  const [description, setDescription] = useState('');

  // 🪙 ESTADOS DA ETAPA 2: Custos e Lote
  const [batchCost, setBatchCost] = useState(0);
  const [unitsPerBatch, setUnitsPerBatch] = useState(1);
  const [productionCostInput, setProductionCostInput] = useState(0);
  const [calculatedProductionCost, setCalculatedProductionCost] = useState(0);
  const [calculatedTotalUnitCost, setCalculatedTotalUnitCost] = useState(0);
  const [abcCategory, setAbcCategory] = useState('C');

  // 📊 ESTADOS DA ETAPA 3: Precificação & Estoque
  const [salePrice, setSalePrice] = useState(0);
  const [stockQuantity, setStockQuantity] = useState(0);

  // 📁 ESTADOS DA ETAPA 4: Capa (Thumbnail) & Anexos
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [medias, setMedias] = useState<MediaItem[]>([]);
  const [activeMedia, setActiveMedia] = useState<MediaItem | null>(null);

  // 📈 Barra de Progresso Verde Dinâmica baseada nas Etapas Concluídas
  const progressPercent = ((step - 1) / 3) * 100;

  // 🧮 Motor de Cálculo Financeiro Automático Integrado (FOTO / PLANILHA)
  useEffect(() => {
    const baseUnitCost = batchCost / (unitsPerBatch || 1);
    setCalculatedProductionCost(baseUnitCost);

    const totalUnit = baseUnitCost + productionCostInput;
    setCalculatedTotalUnitCost(totalUnit);

    if (totalUnit >= 100) setAbcCategory('A');
    else if (totalUnit >= 30) setAbcCategory('B');
    else setAbcCategory('C');
  }, [batchCost, unitsPerBatch, productionCostInput]);

  const handleNextStep = () => {
    if (step === 1 && (!sku.trim() || !name.trim())) return; // Cláusula de barreira obrigatória
    setStep((prev) => Math.min(prev + 1, 4));
  };

  const handlePrevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/products/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setThumbnail(response.data.url);
    } catch (error) {
      console.error('🔥 Falha ao carregar imagem de capa:', error);
    }
  };

  const handleSubmit = async () => {
    if (!sku || !name) return;

    await onSave({
      sku: sku.trim().toUpperCase(),
      name: name.trim(),
      brand: brand.trim() || 'Sem Marca',
      variation: variation.trim() || null,
      description: description.trim() || null,
      batchCost,
      unitsPerBatch,
      productionCost: productionCostInput,
      totalUnitCost: calculatedTotalUnitCost,
      abcCategory,
      salePrice,
      stockQuantity,
      thumbnail,
      medias: JSON.stringify(medias)
    });

    handleReset();
  };

  const handleReset = () => {
    setStep(1); setSku(''); setName(''); setBrand(''); setVariation(''); setDescription('');
    setBatchCost(0); setUnitsPerBatch(1); setProductionCostInput(0);
    setSalePrice(0); setStockQuantity(0); setThumbnail(null); setMedias([]);
    onClose();
  };

  if (!isOpen) return null;


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs font-sans text-xs sm:text-sm select-none">
      <motion.div
        initial={{ y: 35, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 35, opacity: 0 }}
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 border border-slate-100 max-h-[90vh] overflow-y-auto space-y-5"
      >
        {/* 🔮 Cabeçalho Superior */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-indigo-600">
            <Tags className="w-5 h-5" />
            <h3 className="text-base font-black text-slate-800">Assistente de Cadastro</h3>
          </div>
          <button type="button" onClick={handleReset} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 📈 INDICADOR VISUAL: Linha Verde de Conclusão Dinâmica */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-slate-400">
            <span>Etapa {step} de 4</span>
            <span className="text-emerald-600 font-bold">
              {step === 1 && 'Identificação'}
              {step === 2 && 'Custos & Lote'}
              {step === 3 && 'Precificação'}
              {step === 4 && 'Mídias & Conclusão'}
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ type: 'spring', damping: 20, stiffness: 100 }}
              className="h-full bg-emerald-500 rounded-full"
            />
          </div>
        </div>

        {/* 🎛️ Área Central: Invocação das Etapas Fatiadas por Chamadas Limpas */}
        <div className="py-2 min-h-[180px]">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }}>
                <StepIdentification sku={sku} setSku={setSku} name={name} setName={setName} brand={brand} setBrand={setBrand} variation={variation} setVariation={setVariation} description={description} setDescription={setDescription} />
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }}>
                <StepCosts batchCost={batchCost} setBatchCost={setBatchCost} unitsPerBatch={unitsPerBatch} setUnitsPerBatch={setUnitsPerBatch} productionCostInput={productionCostInput} setProductionCostInput={setProductionCostInput} calculatedProductionCost={calculatedProductionCost} calculatedTotalUnitCost={calculatedTotalUnitCost} />
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }}>
                <StepPricing salePrice={salePrice} setSalePrice={setSalePrice} stockQuantity={stockQuantity} setStockQuantity={setStockQuantity} abcCategory={abcCategory} setAbcCategory={setAbcCategory} />
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="s4" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }}>
                <StepMedia thumbnail={thumbnail} medias={medias} setMedias={setMedias} setActiveMedia={setActiveMedia} handleThumbnailUpload={handleThumbnailUpload} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 🛠️ Barra de Ações Inferiores de Navegação */}
        <div className="flex gap-2 border-t border-slate-100 pt-4 text-xs font-bold">
          {step > 1 ? (
            <button type="button" onClick={handlePrevStep} className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors cursor-pointer flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> <span>Voltar</span>
            </button>
          ) : (
            <button type="button" onClick={handleReset} className="px-4 py-2.5 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-xl transition-colors cursor-pointer">
              Cancelar
            </button>
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={handleNextStep}
              disabled={step === 1 && (!sku.trim() || !name.trim())}
              className={`px-5 py-2.5 font-bold rounded-xl text-white transition-all flex items-center gap-1 cursor-pointer ml-auto ${step === 1 && (!sku.trim() || !name.trim()) ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' : 'bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100'
                }`}
            >
              <span>Avançar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button type="button" onClick={handleSubmit} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl transition-colors flex items-center gap-1 shadow-md shadow-emerald-100 cursor-pointer ml-auto">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Concluir Cadastro</span>
            </button>
          )}
        </div>
      </motion.div>

      {/* 🖼️ Lightbox de tela cheia linear para mídias do produto (COMPONENTE REUTILIZADO) */}
      <MediaLightbox isOpen={activeMedia !== null} medias={medias} activeMedia={activeMedia} onClose={() => setActiveMedia(null)} onSelectMedia={(media) => setActiveMedia(media)} />
    </div>
  );
}