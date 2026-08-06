import { api } from '../../../api/client.ts';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, FileText, ChevronRight, Check, ImageIcon} from 'lucide-react';
import { type MediaItem } from '../../../types/appointment.ts';
import { CustomerAccordion } from '../../../components/CustomerAccordion.tsx';
import { FinancialManager } from '../../../components/FinancialManager.tsx';
import { MediaManager } from '../../../components/MediaManager.tsx';


interface AppointmentModalProps {
  onSave: (payload: any) => Promise<void>;
}

export function AppointmentModal({ onSave }: AppointmentModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1); // 🔢 Controla qual etapa está ativa (1 a 4)

  // 📝 ETAPA 1: ESTADOS OBRIGATÓRIOS E OBSERVAÇÕES
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10)); // Padrão: dia de hoje
  const [description, setDescription] = useState('');

  // 📝 ESTADOS DAS PRÓXIMAS ETAPAS (Preparados para as tarefas seguintes)
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [documentType, setDocumentType] = useState('CPF');
  const [documentNumber, setDocumentNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [cep, setCep] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [street, setStreet] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [referencePoint, setReferencePoint] = useState('');
  const [medias, setMedias] = useState<any[]>([]);
  const [activeMedia, setActiveMídia] = useState<MediaItem | null>(null);
  const [financials, setFinancials] = useState<any[]>([]);

  const [openSection, setOpenSection] = useState<'id' | 'contact' | 'address' | null>(null);

  useEffect(() => {
    const autoFill = async () => {
      const cleanCEP = cep.replace(/\D/g, '');
      if (cleanCEP.length === 8) {
        // Importa a função dinamicamente ou use o import normal no topo
        const { fetchAddressByCEP } = await import('../../../utils/cep.ts');
        const data = await fetchAddressByCEP(cleanCEP);

        if (data) {
          setStreet(data.logradouro);
          setNeighborhood(data.bairro);
          setCity(data.localidade);
          setState(data.uf);
          // Foca automaticamente no input de número da casa por conveniência
          console.log('[DEBUG CEP] Endereço autocompletado com sucesso!');
        }
      }
    };

    autoFill();
  }, [cep]);


  // 🚀 Envio final unificado para a API
  const handleFinalSubmit = async () => {
    const filteredFinancials = financials.filter(f => f.description.trim() !== '');

    await onSave({
      title,
      time,
      createdAt: date,
      description: description.trim() || null,
      firstName: firstName.trim() || null,
      lastName: lastName.trim() || null,
      documentType,
      documentNumber: documentNumber.trim() || null,
      phone: phone.trim() || null,
      email: email.trim() || null,
      cep: cep.trim() || null,
      state: state.trim() || null,
      city: city.trim() || null,
      neighborhood: neighborhood.trim() || null,
      street: street.trim() || null,
      houseNumber: houseNumber.trim() || null,
      complement: complement.trim() || null,
      referencePoint: referencePoint.trim() || null,
      medias: medias.length > 0 ? JSON.stringify(medias) : null,
      financials: filteredFinancials.length > 0 ? JSON.stringify(filteredFinancials) : null,
    });
    handleResetModal();
  };

  const handleResetModal = () => {
    setTitle(''); setTime(''); setDescription('');
    setStep(1); setIsOpen(false);
  };


  return (
    <>
      {/* Botão Fixo de Gatilho na Tela */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-6 z-40 flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white font-bold rounded-full shadow-lg hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all cursor-pointer font-sans"
      >
        <Plus className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs font-sans">
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 flex flex-col max-h-[90vh] overflow-y-auto"
            >
              {/* Header do Wizard com Indicador Visual de Progresso */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-7 h-7 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-black">
                    {step}/4
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-800">Criar Novo Agendamento</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      {step === 1 && "Etapa 1: Dados do Agendamento"}
                      {step === 2 && "Etapa 2: Cadastro do Cliente"}
                      {step === 3 && "Etapa 3: Anexar Mídias"}
                      {step === 4 && "Etapa 4: Lançamento Financeiro"}
                    </p>
                  </div>
                </div>
                <button type="button" onClick={handleResetModal} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 🧩 CONTEÚDO DINÂMICO DO WIZARD POR ETAPAS */}
              <div className="flex-1 space-y-4 mb-6">

                {/* ✨ ETAPA 1: INPUTS DO AGENDAMENTO (OBRIGATÓRIO) */}
                {step === 1 && (
                  <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Nome do Agendamento *</label>
                      <input
                        type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                        placeholder="Ex: Consultoria de Negócios"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-indigo-500 font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Data Agendada *</label>
                        <input
                          type="date" required value={date} onChange={(e) => setDate(e.target.value)}
                          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none cursor-pointer h-[38px] font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Horário *</label>
                        <input
                          type="time" required value={time} onChange={(e) => setTime(e.target.value)}
                          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none h-[38px]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Observações da Tarefa</label>
                      <textarea
                        value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
                        placeholder="Insira notas explicativas ou observações sobre a tarefa..."
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none resize-none"
                      />
                    </div>
                  </motion.div>
                )}

                {/* Os placeholders para step === 2, 3 e 4 serão substituídos nas próximas tarefas */}
                {/* 🧩 ETAPA 2: CADASTRO DO CLIENTE (TOTALMENTE OPCIONAL) */}
                {step === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-2 max-h-[55vh] overflow-y-auto pr-1"
                  >
                    <p className="text-xs text-slate-400 font-medium mb-3">
                      Preencha os dados cadastrais do cliente abaixo ou clique em "Pular Etapa" para avançar de forma rápida.
                    </p>

                    {/* ✨ O Accordion encapsulado cuida de toda a interface e regras visuais */}
                    <CustomerAccordion
                      data={{
                        firstName, lastName, documentType, documentNumber,
                        phone, email, cep, state, city, neighborhood,
                        street, houseNumber, complement, referencePoint
                      }}
                      onChangeField={(field, value) => {
                        if (field === 'firstName') setFirstName(value);
                        else if (field === 'lastName') setLastName(value);
                        else if (field === 'documentType') setDocumentType(value);
                        else if (field === 'documentNumber') setDocumentNumber(value);
                        else if (field === 'phone') setPhone(value);
                        else if (field === 'email') setEmail(value);
                        else if (field === 'cep') setCep(value);
                        else if (field === 'state') setState(value);
                        else if (field === 'city') setCity(value);
                        else if (field === 'neighborhood') setNeighborhood(value);
                        else if (field === 'street') setStreet(value);
                        else if (field === 'houseNumber') setHouseNumber(value);
                        else if (field === 'complement') setComplement(value);
                        else if (field === 'referencePoint') setReferencePoint(value);
                      }}
                    />
                  </motion.div>
                )}

                {/* 🧩 ETAPA 3: ANEXAR MÍDIAS REORGANIZADA (CLEAN CODE) */}
                {step === 3 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <p className="text-xs text-slate-400 font-medium">
                      Anexe fotos, comprovantes ou documentos a este agendamento ou clique em "Pular Etapa".
                    </p>

                    {/* ✨ O MediaManager encapsula de forma limpa todas as regras e a API de upload real */}
                    <MediaManager
                      medias={medias}
                      onChangeMedias={(updated) => setMedias(updated)}
                      onOpenLightbox={(media) => {
                        // Joga a mídia para o estado se tiver um Lightbox ativo no Modal de criar
                        console.log('[DEBUG WIZARD] Abrindo Lightbox para:', media.name);
                      }}
                    />
                  </motion.div>
                )}

                {/* ETAPA 4: FINANCEIRO */}
                {step === 4 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <p className="text-xs text-slate-400 font-medium">
                      Lance receitas ou despesas iniciais vinculadas a este agendamento ou clique em "Concluir Agendamento".
                    </p>

                    {/* ✨ O FinancialManager encapsula de forma limpa todas as regras e inputs */}
                    <FinancialManager
                      financials={financials}
                      onChangeFinancials={(updated) => setFinancials(updated)}
                    />
                  </motion.div>
                )}
              </div>

              {/* 🛠️ BARRA DE NAVEGAÇÃO DO WIZARD (BOTÕES) */}
              <div className="flex gap-3 border-t border-slate-100 pt-4 justify-end">
                <button
                  type="button" onClick={handleResetModal}
                  className="px-5 py-2 text-sm font-semibold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>

                {/* Botão Avançar: Só fica ativo na Etapa 1 se os campos obrigatórios estiverem preenchidos */}
                {step === 1 && (
                  <button
                    type="button"
                    disabled={!title || !time || !date}
                    onClick={() => setStep(2)}
                    className="flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-all cursor-pointer shadow-md shadow-indigo-100"
                  >
                    <span>Próximo</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}

                {step === 2 && (
                  <button
                    type="button"
                    onClick={() => { setStep(3); setOpenSection(null); }}
                    className="flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all cursor-pointer shadow-md"
                  >
                    <span>{(!firstName && !phone && !cep) ? "Pular Etapa" : "Avançar"}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}

                {step === 3 && (
                  <button
                    type="button"
                    onClick={() => { setStep(4); }}
                    className="flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all cursor-pointer shadow-md"
                  >
                    <span>{medias.length === 0 ? "Pular Etapa" : "Avançar"}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}

                {step === 4 && (
                  <button
                    type="button"
                    onClick={handleFinalSubmit}
                    className="flex items-center gap-1.5 px-5 py-2 text-sm font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all cursor-pointer shadow-md shadow-emerald-100 animate-pulse hover:animate-none"
                  >
                    <Check className="w-4 h-4" />
                    <span>Concluir Agendamento</span>
                  </button>
                )}
              </div>

            </motion.div>

            <AnimatePresence>
              {activeMedia && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setActiveMídia(null)}
                  className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-4 backdrop-blur-md"
                >
                  {/* Botão de Fechar Superior */}
                  <button
                    onClick={() => setActiveMídia(null)}
                    className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <motion.div
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.95 }}
                    onClick={(e) => e.stopPropagation()} // Impede fechar ao clicar no meio da mídia
                    className="max-w-4xl max-h-[80vh] w-full flex items-center justify-center rounded-2xl overflow-hidden shadow-2xl"
                  >
                    {/* 🖼️ Renderização Condicional: Imagem */}
                    {activeMedia.type === 'image' && (
                      <img src={activeMedia.url} alt={activeMedia.name} className="object-contain max-w-full max-h-[80vh] rounded-xl" />
                    )}

                    {/* 🎥 Renderização Condicional: Player de Vídeo Nativo */}
                    {activeMedia.type === 'video' && (
                      <video
                        src={activeMedia.url}
                        controls
                        autoPlay
                        className="w-full max-h-[80vh] rounded-xl bg-black focus:outline-none"
                      />
                    )}

                    {/* 📄 Renderização Condicional: Documento Geral */}
                    {activeMedia.type === 'document' && (
                      <div className="bg-white p-8 rounded-2xl flex flex-col items-center gap-4 text-center max-w-sm">
                        <FileText className="w-12 h-12 text-slate-400" />
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm truncate max-w-xs">{activeMedia.name}</h4>
                          <p className="text-xs text-slate-400 mt-1">Este arquivo é um documento e não pode ser pré-visualizado diretamente.</p>
                        </div>
                        <a
                          href={activeMedia.url}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full py-2 bg-indigo-600 text-white font-semibold rounded-xl text-xs hover:bg-indigo-700 transition-colors"
                        >
                          Abrir em Nova Aba
                        </a>
                      </div>
                    )}
                  </motion.div>

                  <span className="text-white/60 text-xs mt-3 font-medium truncate max-w-md">{activeMedia.name}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
