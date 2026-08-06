import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BRAZILIAN_STATES } from '../utils/states.ts';
import { maskCPF, maskPhone, maskCEP, maskRG, isValidEmail } from '../utils/format.ts';

interface CustomerAccordionProps {
    data: {
        firstName: string;
        lastName: string;
        documentType: string;
        documentNumber: string;
        phone: string;
        email: string;
        cep: string;
        state: string;
        city: string;
        neighborhood: string;
        street: string;
        houseNumber: string;
        complement: string;
        referencePoint: string;
    };
    onChangeField: (field: string, value: string) => void;
}

export function CustomerAccordion({ data, onChangeField }: CustomerAccordionProps) {
    const [openSection, setOpenSection] = useState<'id' | 'contact' | 'address' | null>(null);

    return (
        <div className="space-y-2 border-t border-b border-slate-100 py-4">

            {/* 🧩 CATEGORIA 1: IDENTIFICAÇÃO */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
                <button
                    type="button"
                    onClick={() => setOpenSection(openSection === 'id' ? null : 'id')}
                    className="w-full flex items-center justify-between px-4 py-3 bg-slate-50/50 hover:bg-slate-50 transition-colors text-slate-700 font-bold text-sm cursor-pointer"
                >
                    <span>Identificação</span>
                    {/* Seta animada: Gira suavemente com base no estado aberto/fechado */}
                    <motion.span animate={{ rotate: openSection === 'id' ? 90 : 0 }} className="text-slate-400 font-mono text-base block">▶</motion.span>
                </button>

                <AnimatePresence>
                    {openSection === 'id' && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="p-4 bg-white grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100"
                        >
                            <div>
                                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Primeiro Nome</label>
                                <input type="text" value={data.firstName} onChange={(e) => onChangeField('firstName', e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 font-medium text-slate-800" placeholder="Ex: Valdir" />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Sobrenome</label>
                                <input type="text" value={data.lastName} onChange={(e) => onChangeField('lastName', e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 font-medium text-slate-800" placeholder="Ex: Silva" />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Tipo de Documento</label>
                                <select value={data.documentType} onChange={(e) => onChangeField('documentType', e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm h-[38px] cursor-pointer focus:outline-none focus:border-indigo-500 font-medium text-slate-700">
                                    <option value="CPF">CPF</option>
                                    <option value="RG">RG</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Número do Documento</label>
                                <input
                                    type="text"
                                    value={data.documentType === 'CPF' ? maskCPF(data.documentNumber) : maskRG(data.documentNumber)}
                                    onChange={(e) => onChangeField('documentNumber', e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 font-medium text-slate-800"
                                    placeholder={data.documentType === 'CPF' ? "000.000.000-00" : "00.000.000-0"}
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* 🧩 CATEGORIA 2: CONTATO */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-3xs">
                <button
                    type="button"
                    onClick={() => setOpenSection(openSection === 'contact' ? null : 'contact')}
                    className="w-full flex items-center justify-between px-4 py-3 bg-slate-50/50 hover:bg-slate-50 transition-colors text-slate-700 font-bold text-sm cursor-pointer"
                >
                    <span>Contato</span>
                    <motion.span animate={{ rotate: openSection === 'contact' ? 90 : 0 }} className="text-slate-400 font-mono text-xs block">▶</motion.span>
                </button>

                <AnimatePresence>
                    {openSection === 'contact' && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="p-4 bg-white grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100">
                            <div>
                                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Telefone / WhatsApp</label>
                                <input type="tel" value={maskPhone(data.phone)} onChange={(e) => onChangeField('phone', e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 font-medium text-slate-800" placeholder="(00) 00000-0000" />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">E-mail</label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => onChangeField('email', e.target.value)}
                                    className={`w-full px-3 py-2 bg-slate-50 border rounded-xl text-sm focus:outline-none font-medium text-slate-800 ${data.email && !isValidEmail(data.email) ? 'border-red-300 focus:border-red-500 bg-red-50/5' : 'border-slate-200 focus:border-indigo-500'
                                        }`}
                                    placeholder="exemplo@email.com"
                                />
                                {data.email && !isValidEmail(data.email) && (
                                    <span className="text-[10px] text-red-500 font-bold block mt-1">Insira um e-mail válido.</span>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* 🧩 CATEGORIA 3: ENDEREÇO */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-3xs">
                <button
                    type="button"
                    onClick={() => setOpenSection(openSection === 'address' ? null : 'address')}
                    className="w-full flex items-center justify-between px-4 py-3 bg-slate-50/50 hover:bg-slate-50 transition-colors text-slate-700 font-bold text-sm cursor-pointer"
                >
                    <span>Endereço</span>
                    <motion.span animate={{ rotate: openSection === 'address' ? 90 : 0 }} className="text-slate-400 font-mono text-xs block">▶</motion.span>
                </button>

                <AnimatePresence>
                    {openSection === 'address' && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="p-4 bg-white grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 border-t border-slate-100">
                            <div>
                                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">CEP</label>
                                <input type="text" value={maskCEP(data.cep)} onChange={(e) => onChangeField('cep', e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 font-medium text-slate-800" placeholder="00000-000" />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Estado</label>
                                <select
                                    value={data.state}
                                    onChange={(e) => onChangeField('state', e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm h-[38px] cursor-pointer focus:outline-none focus:border-indigo-500 font-medium text-slate-700"
                                >
                                    <option value="">Selecione...</option>
                                    {BRAZILIAN_STATES.map((uf) => (
                                        <option key={uf} value={uf}>{uf}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Cidade</label>
                                <input type="text" value={data.city} onChange={(e) => onChangeField('city', e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 font-medium text-slate-800" placeholder="Ex: Campinas" />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Rua / Logradouro</label>
                                <input type="text" value={data.street} onChange={(e) => onChangeField('street', e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 font-medium text-slate-800" placeholder="Nome da rua" />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Número</label>
                                <input type="text" value={data.houseNumber} onChange={(e) => onChangeField('houseNumber', e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm" placeholder="Nº da casa" />
                            </div>
                            <div className="md:col-span-1">
                                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Complemento</label>
                                <input type="text" value={data.complement} onChange={(e) => onChangeField('complement', e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm" placeholder="Apto, Bloco, etc." />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Ponto de Referência</label>
                                <input type="text" value={data.referencePoint} onChange={(e) => onChangeField('referencePoint', e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm" placeholder="Próximo a qual local conhecido?" />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}