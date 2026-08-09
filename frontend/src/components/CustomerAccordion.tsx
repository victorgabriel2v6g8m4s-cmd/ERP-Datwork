import { useState } from 'react';
import { UserCheck, PhoneCall, MapPin } from 'lucide-react';
import { BRAZILIAN_STATES } from '../utils/states.ts';
import { maskCPF, maskPhone, maskCEP, maskRG, isValidEmail } from '../utils/format.ts';
import { UniversalAccordion } from './UniversalAccordion.tsx'; // ✨ Plugada a casca visual universal!

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
    // O controle de estado local fica limpo, lidando apenas com a aba ativa
    const [openSection, setOpenSection] = useState<string | null>(null);

    return (
        <div className="space-y-2 border-t border-b border-slate-100/80 py-4 w-full block">

            {/* 🧩 CATEGORIA 1: IDENTIFICAÇÃO */}
            <UniversalAccordion id="id" title="Identificação" icon={UserCheck} currentOpenSection={openSection} setOpenSection={setOpenSection}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1 select-none">Primeiro Nome</label>
                        <input type="text" value={data.firstName} onChange={(e) => onChangeField('firstName', e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 font-medium text-slate-800" placeholder="Ex: Valdir" />
                    </div>
                    <div>
                        <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1 select-none">Sobrenome</label>
                        <input type="text" value={data.lastName} onChange={(e) => onChangeField('lastName', e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 font-medium text-slate-800" placeholder="Ex: Silva" />
                    </div>
                    <div>
                        <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1 select-none">Tipo de Documento</label>
                        <select value={data.documentType} onChange={(e) => onChangeField('documentType', e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm h-[38px] cursor-pointer focus:outline-none focus:border-indigo-500 font-medium text-slate-700">
                            <option value="CPF">CPF</option>
                            <option value="RG">RG</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1 select-none">Número do Documento</label>
                        <input
                            type="text"
                            value={data.documentType === 'CPF' ? maskCPF(data.documentNumber) : maskRG(data.documentNumber)}
                            onChange={(e) => onChangeField('documentNumber', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 font-medium text-slate-800"
                            placeholder={data.documentType === 'CPF' ? "000.000.000-00" : "00.000.000-0"}
                        />
                    </div>
                </div>
            </UniversalAccordion>

            {/* 🧩 CATEGORIA 2: CONTATO */}
            <UniversalAccordion id="contact" title="Contato" icon={PhoneCall} currentOpenSection={openSection} setOpenSection={setOpenSection}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1 select-none">Telefone / WhatsApp</label>
                        <input type="tel" value={maskPhone(data.phone)} onChange={(e) => onChangeField('phone', e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 font-medium text-slate-800" placeholder="(00) 00000-0000" />
                    </div>
                    <div>
                        <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1 select-none">E-mail</label>
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
                </div>
            </UniversalAccordion>

            {/* 🧩 CATEGORIA 3: ENDEREÇO */}
            <UniversalAccordion id="address" title="Endereço" icon={MapPin} currentOpenSection={openSection} setOpenSection={setOpenSection}>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    <div>
                        <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1 select-none">CEP</label>
                        <input type="text" value={maskCEP(data.cep)} onChange={(e) => onChangeField('cep', e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 font-medium text-slate-800" placeholder="00000-000" />
                    </div>
                    <div>
                        <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1 select-none">Estado</label>
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
                        <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1 select-none">Cidade</label>
                        <input type="text" value={data.city} onChange={(e) => onChangeField('city', e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 font-medium text-slate-800" placeholder="Ex: Campinas" />
                    </div>
                    <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1 select-none">Rua / Logradouro</label>
                        <input type="text" value={data.street} onChange={(e) => onChangeField('street', e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 font-medium text-slate-800" placeholder="Nome da rua" />
                    </div>
                    <div>
                        <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1 select-none">Número</label>
                        <input type="text" value={data.houseNumber} onChange={(e) => onChangeField('houseNumber', e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500 font-medium" placeholder="Nº da casa" />
                    </div>
                    <div className="md:col-span-1">
                        <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1 select-none">Complemento</label>
                        <input type="text" value={data.complement} onChange={(e) => onChangeField('complement', e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500 font-medium" placeholder="Apto, Bloco, etc." />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1 select-none">Ponto de Referência</label>
                        <input type="text" value={data.referencePoint} onChange={(e) => onChangeField('referencePoint', e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500 font-medium" placeholder="Próximo a qual local conhecido?" />
                    </div>
                </div>
            </UniversalAccordion>

        </div>
    );
}
