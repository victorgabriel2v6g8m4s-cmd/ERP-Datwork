import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Edit2, Trash2 } from 'lucide-react';

interface OrderProfile {
  id: string;
  name: string;
  positions: string; // JSON
}

interface OrderProfilesManagerProps {
  profiles: OrderProfile[];
  onSaveNewProfile: (name: string) => Promise<void>;
  onRenameProfile: (id: string, newName: string) => Promise<void>;
  onDeleteProfile: (id: string) => Promise<void>;
  onSelectProfile: (positionsJson: string) => void;
  contextLabel?: string; // ✨ Propriedade de Contexto: "Produtos" ou "Insumos"
}

export function OrderProfilesManager({
  profiles,
  onSaveNewProfile,
  onRenameProfile,
  onDeleteProfile,
  onSelectProfile,
  contextLabel = "Itens" // Valor padrão inerte
}: OrderProfilesManagerProps) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [selectedId, setSelectedId] = useState('');

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) return;
    onSaveNewProfile(profileName.trim());
    setProfileName('');
    setIsPopupOpen(false);
  };

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim() || !selectedId) return;
    onRenameProfile(selectedId, profileName.trim());
    setProfileName('');
    setSelectedId('');
    setIsRenameOpen(false);
  };

  return (
    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 space-y-3 font-sans text-xs w-full">
      <div className="flex items-center justify-between w-full">
        <span className="font-black text-slate-500 uppercase tracking-wider block">Perfis de Ordenação Customizados</span>
        <button
          type="button"
          onClick={() => setIsPopupOpen(true)}
          className="flex items-center gap-1 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all cursor-pointer shadow-3xs"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Salvar Ordem Atual</span>
        </button>
      </div>

      <div className="flex flex-wrap gap-2 w-full">
        {profiles.map((p) => (
          <div
            key={p.id}
            className="group relative flex items-center bg-white border border-slate-200 rounded-xl pl-3 pr-2 py-1.5 gap-2 shadow-3xs hover:border-indigo-300 transition-all"
          >
            <button
              type="button"
              onClick={() => onSelectProfile(p.positions)}
              onContextMenu={(e) => {
                e.preventDefault();
                setSelectedId(p.id);
                setProfileName(p.name);
                setIsRenameOpen(true);
              }}
              className="font-bold text-slate-700 hover:text-indigo-600 transition-colors cursor-pointer text-left truncate max-w-[120px]"
              title="Clique para aplicar. Botão direito ou segure para renomear."
            >
              {p.name}
            </button>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() => {
                  setSelectedId(p.id);
                  setProfileName(p.name);
                  setIsRenameOpen(true);
                }}
                className="p-1 text-slate-400 hover:text-indigo-600 rounded"
              >
                <Edit2 className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => onDeleteProfile(p.id)}
                className="p-1 text-slate-400 hover:text-red-600 rounded"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}

        {profiles.length === 0 && (
          <span className="text-slate-400 font-medium italic block py-1">Nenhum perfil de ordenação salvo para estes {contextLabel}.</span>
        )}
      </div>

      {/* POPUP 1: INSERIR NOME */}
      <AnimatePresence>
        {isPopupOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.form
              onSubmit={handleSaveSubmit}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-5 max-w-sm w-full space-y-4 border border-slate-100 shadow-xl"
            >
              <h3 className="font-black text-slate-800 text-sm">Salvar Perfil de Ordenação</h3>
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Nome da Configuração de {contextLabel}</label>
                <input
                  type="text" required value={profileName} onChange={(e) => setProfileName(e.target.value)}
                  placeholder="Ex: Layout de Maior Giro"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex gap-2 text-xs font-bold pt-2">
                <button type="button" onClick={() => setIsPopupOpen(false)} className="flex-1 py-2 bg-slate-100 text-slate-500 rounded-xl cursor-pointer">Cancelar</button>
                <button type="submit" className="flex-1 py-2 bg-indigo-600 text-white rounded-xl cursor-pointer shadow-md shadow-indigo-100">Confirmar</button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

      {/* POPUP 2: RENOMEAR */}
      <AnimatePresence>
        {isRenameOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.form
              onSubmit={handleRenameSubmit}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-5 max-w-sm w-full space-y-4 border border-slate-100 shadow-xl"
            >
              <h3 className="font-black text-slate-800 text-sm">Renomear Configuração</h3>
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Novo Nome da Fila</label>
                <input
                  type="text" required value={profileName} onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex gap-2 text-xs font-bold pt-2">
                <button type="button" onClick={() => { setIsRenameOpen(false); setSelectedId(''); setProfileName(''); }} className="flex-1 py-2 bg-slate-100 text-slate-500 rounded-xl cursor-pointer">Cancelar</button>
                <button type="submit" className="flex-1 py-2 bg-emerald-600 text-white rounded-xl cursor-pointer shadow-md shadow-emerald-100">Atualizar</button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
