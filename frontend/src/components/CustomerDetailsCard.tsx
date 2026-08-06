import { ShieldAlert, PhoneCall, MapPin } from 'lucide-react';
import { type Appointment } from '../types/appointment.ts';

interface CustomerDetailsCardProps {
    appointment: Appointment;
}

export function CustomerDetailsCard({ appointment }: CustomerDetailsCardProps) {
    const hasIdentity = appointment.firstName || appointment.lastName || appointment.documentNumber;
    const hasContact = appointment.phone || appointment.email;
    const hasAddress = appointment.cep || appointment.city || appointment.street;

    return (
        <div className="space-y-4 w-full">
            {/* 🧩 BLOCO 1: IDENTIFICAÇÃO */}
            {hasIdentity && (
                <div className="space-y-2">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <ShieldAlert className="w-3.5 h-3.5" /> Identificação do Cliente
                    </h4>
                    <div className="bg-white border border-slate-100 shadow-2xs rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        {(appointment.firstName || appointment.lastName) && (
                            <div>
                                <span className="block text-[10px] font-bold text-slate-400 uppercase">Nome Completo</span>
                                <span className="font-semibold text-slate-700">{appointment.firstName} {appointment.lastName}</span>
                            </div>
                        )}
                        {appointment.documentNumber && (
                            <div>
                                <span className="block text-[10px] font-bold text-slate-400 uppercase">{appointment.documentType || 'Documento'}</span>
                                <span className="font-semibold text-slate-700 tabular-nums">{appointment.documentNumber}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* 🧩 BLOCO 2: CONTATO */}
            {hasContact && (
                <div className="space-y-2">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <PhoneCall className="w-3.5 h-3.5" /> Informações de Contato
                    </h4>
                    <div className="bg-white border border-slate-100 shadow-2xs rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        {appointment.phone && (
                            <div>
                                <span className="block text-[10px] font-bold text-slate-400 uppercase">Telefone / WhatsApp</span>
                                <span className="font-semibold text-indigo-600 tabular-nums">{appointment.phone}</span>
                            </div>
                        )}
                        {appointment.email && (
                            <div>
                                <span className="block text-[10px] font-bold text-slate-400 uppercase">E-mail</span>
                                <span className="font-semibold text-slate-700 break-all">{appointment.email}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* 🧩 BLOCO 3: ENDEREÇO */}
            {hasAddress && (
                <div className="space-y-2">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> Endereço Registrado
                    </h4>
                    <div className="bg-white border border-slate-100 shadow-2xs rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                        {appointment.cep && (
                            <div>
                                <span className="block text-[10px] font-bold text-slate-400 uppercase">CEP</span>
                                <span className="font-semibold text-slate-700 tabular-nums">{appointment.cep}</span>
                            </div>
                        )}
                        {appointment.city && (
                            <div className="sm:col-span-2">
                                <span className="block text-[10px] font-bold text-slate-400 uppercase">Cidade / Estado</span>
                                <span className="font-semibold text-slate-700">{appointment.city} - {appointment.state || ''}</span>
                            </div>
                        )}
                        {appointment.street && (
                            <div className="sm:col-span-2">
                                <span className="block text-[10px] font-bold text-slate-400 uppercase">Rua / Logradouro</span>
                                <span className="font-semibold text-slate-700">{appointment.street}, Nº {appointment.houseNumber || 'S/N'}</span>
                            </div>
                        )}
                        {appointment.neighborhood && (
                            <div>
                                <span className="block text-[10px] font-bold text-slate-400 uppercase">Bairro</span>
                                <span className="font-semibold text-slate-700">{appointment.neighborhood}</span>
                            </div>
                        )}
                        {appointment.complement && (
                            <div className="sm:col-span-3 border-t border-slate-50 pt-1">
                                <span className="block text-[10px] font-bold text-slate-400 uppercase">Complemento</span>
                                <span className="font-medium text-slate-600 text-xs">{appointment.complement}</span>
                            </div>
                        )}
                        {appointment.referencePoint && (
                            <div className="sm:col-span-3 border-t border-slate-50 pt-1">
                                <span className="block text-[10px] font-bold text-slate-400 uppercase">Ponto de Referência</span>
                                <span className="font-medium text-slate-600 text-xs">{appointment.referencePoint}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
