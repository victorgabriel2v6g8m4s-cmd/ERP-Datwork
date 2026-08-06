import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, TrendingUp, Archive, DollarSign, Award, Layers } from 'lucide-react';
import { api } from '../../../api/client.ts';
import { type Product } from '../../../types/product.ts';
import { formatCurrencyBRL } from '../../../utils/format.ts';

interface ViewProductModalProps {
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
}

export function ViewProductModal({ isOpen, product, onClose }: ViewProductModalProps) {
  const [versions, setVersions] = useState<any[]>([]);
  const [activeData, setActiveData] = useState<Product | null>(null);
  const [loadingVersions, setLoadingVersions] = useState(false);

  // Sempre que abrir o modal, carrega o histórico de logs do SQLite
  useEffect(() => {
    if (isOpen && product) {
      setActiveData(product); // Define a versão atual (Vite) como padrão na tela
      fetchVersions(product.id);
    }
  }, [isOpen, product]);

  const fetchVersions = async (productId: string) => {
    setLoadingVersions(true);
    try {
      const response = await api.get(`/products/${productId}/versions`);
      setVersions(response.data);
    } catch (error) {
      console.error('🔥 Erro ao carregar histórico de versões:', error);
    } finally {
      setLoadingVersions(false);
    }
  };

  const handleSelectVersion = (snapshotJson: string) => {
    // ✨ REQUISITO CONQUISTADO: Transforma o snapshot congelado do dia na versão ativa da tela
    const historicalProduct = JSON.parse(snapshotJson);
    setActiveData(historicalProduct);
  };

  if (!isOpen || !activeData) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs font-sans text-xs sm:text-sm select-none">
        <motion.div
          initial={{ y: 25, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 25, opacity: 0 }}
          className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl p-6 border border-slate-100 max-h-[85vh] overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-6 relative"
        >
          {/* Botão de Fechar Absoluto */}
          <button onClick={onClose} className="absolute top-4 right-4 p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors cursor-pointer z-10">
            <X className="w-4 h-4" />
          </button>

          {/* 📊 COLUNA 1 & 2: DADOS COMERCIAIS E MÉTRICAS DA VERSÃO EM EXIBIÇÃO */}
          <div className="md:col-span-2 space-y-4 pr-1">
            <div className="flex gap-4 items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="w-16 h-100 max-h-[64px] aspect-square rounded-xl bg-slate-900 overflow-hidden flex items-center justify-center shadow-3xs">
                {activeData.thumbnail ? (
                  <img src={activeData.thumbnail} alt={activeData.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[10px] font-black text-white">BOX</span>
                )}
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md uppercase tracking-wider tabular-nums font-mono">{activeData.sku}</span>
                <h3 className="text-base font-black text-slate-800 truncate mt-1 leading-tight">{activeData.name}</h3>
                <p className="text-[11px] text-slate-400 font-bold truncate">{activeData.brand} {activeData.variation ? `• ${activeData.variation}` : ''}</p>
              </div>
            </div>

            {/* Painel de Métricas Comerciais e Saídas */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white border border-slate-100 p-3 rounded-2xl shadow-3xs space-y-1">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-indigo-500" /> Preço Praticado (Venda)
                </span>
                <span className="text-sm font-black text-slate-800 tabular-nums">
                  {/* ✨ Atualizado: Trocado 'salePrice' por 'finalPrice' */}
                  {formatCurrencyBRL(activeData.finalPrice || 0)}
                </span>
              </div>
              <div className="bg-white border border-slate-100 p-3 rounded-2xl shadow-3xs space-y-1">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-emerald-500" /> Preço Sugerido (Markup)
                </span>
                <span className="text-sm font-black text-emerald-600 tabular-nums">
                  {/* ✨ Novo: Injetada a propriedade calculada estavelmente pelo backend */}
                  {formatCurrencyBRL(activeData.suggestedPrice || 0)}
                </span>
              </div>
              <div className="bg-white border border-slate-100 p-3 rounded-2xl shadow-3xs space-y-1">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-indigo-500" /> Lucro Líquido Real
                </span>
                <span className={`text-sm font-black tabular-nums ${activeData.predictedNetProfit >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
                  {/* ✨ Novo: Exibe o ganho monetário limpo deduzido de custos e despesas */}
                  {formatCurrencyBRL(activeData.predictedNetProfit || 0)}
                </span>
              </div>
              <div className="bg-white border border-slate-100 p-3 rounded-2xl shadow-3xs space-y-1">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                  <Layers className="w-3 h-3 text-amber-500" /> Curva ABC Vinculada
                </span>
                <span className="text-sm font-black text-amber-700">
                  Classe {activeData.abcCategory || 'C'}
                </span>
              </div>
            </div>

            {/* Descrição Textual */}
            <div className="space-y-1">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Ficha Técnica / Observações</span>
              <p className="text-xs text-slate-600 font-medium bg-slate-50/60 p-3 rounded-xl border border-slate-100 leading-relaxed whitespace-pre-line">
                {activeData.description || 'Nenhuma descrição complementar adicionada a este produto.'}
              </p>
            </div>

            <div className="text-[10px] text-slate-400 font-bold block pt-1">
              Data de cadastro deste lote: {new Date(activeData.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </div>
          </div>

          {/* 📅 COLUNA 3: LINHA DO TEMPO CRONOLÓGICA DE VERSÕES ANTERIORES */}
          <div className="border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-4 space-y-3">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" /> Versões por Data
            </h4>

            {loadingVersions ? (
              <div className="text-center py-6 text-slate-400 font-semibold animate-pulse">Buscando logs...</div>
            ) : (
              <div className="space-y-1.5 max-h-[45vh] overflow-y-auto pr-1 divide-y divide-slate-50">
                {versions.map((v, index) => {
                  const isCurrentSelected = activeData.updatedAt === JSON.parse(v.snapshotData).updatedAt;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => handleSelectVersion(v.snapshotData)}
                      className={`w-full text-left p-2 rounded-xl border font-sans text-xs transition-all block cursor-pointer ${isCurrentSelected
                        ? 'bg-indigo-600 border-indigo-600 text-white font-bold shadow-3xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                      <div className="text-[10px] font-black tracking-wide uppercase opacity-75">Cópia V{versions.length - index}</div>
                      <div className="font-semibold tabular-nums mt-0.5">
                        {new Date(v.versionDate).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
