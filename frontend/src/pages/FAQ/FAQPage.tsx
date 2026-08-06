import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, HelpCircle } from 'lucide-react';
import { GlobalFooterNav } from '../../components/GlobalFooterNav.tsx';

export function FAQPage() {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    { q: 'Como lançar uma despesa ou receita?', a: 'Dentro do formulário de criação ou edição de qualquer agendamento, acesse a quarta etapa "Movimentação Financeira", digite o valor e selecione se é uma entrada (+) ou saída (-).' },
    { q: 'O que representa o Resultado Líquido Real?', a: 'É o faturamento bruto subtraindo os custos diretos lançados nas tarefas, somado às deduções de impostos (21%) e custos fixos configurados no painel de precificação.' },
    { q: 'Como atualizar o endereço usando apenas o CEP?', a: 'Na aba de endereço do cadastro, digite os 8 dígitos do CEP. O sistema fará uma consulta automática de proxy através do servidor e preencherá a rua, bairro, cidade e estado em tempo real.' },
    { q: 'Por que minhas mídias e fotos sumiram?', a: 'Nas versões anteriores, as imagens ficavam salvas temporariamente na memória. Agora, os arquivos passam por upload real e são salvos fisicamente na pasta do servidor Node.js de forma permanente.' }
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto px-4 py-8 space-y-6 pb-24 font-sans select-none">
      <div className="flex items-center gap-3 border-b border-slate-200 pb-5">
        <button onClick={() => navigate('/home')} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all cursor-pointer shadow-3xs">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg"><HelpCircle className="w-4 h-4" /></div>
          <div>
            <h1 className="text-base font-black text-slate-900 tracking-tight">Perguntas Frequentes (FAQ)</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Central de Ajuda Integrada</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {faqs.map((faq, idx) => (
          <div key={idx} className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-3xs">
            <button
              type="button" onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors text-slate-700 font-bold text-xs sm:text-sm text-left cursor-pointer"
            >
              <span>{faq.q}</span>
              <motion.span animate={{ rotate: openIndex === idx ? 90 : 0 }} className="text-slate-400 text-xs block">▶</motion.span>
            </button>
            <AnimatePresence>
              {openIndex === idx && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="p-4 bg-slate-50/50 border-t border-slate-100 text-xs text-slate-600 leading-relaxed font-medium">
                  {faq.a}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      <GlobalFooterNav />
    </motion.div>
  );
}
