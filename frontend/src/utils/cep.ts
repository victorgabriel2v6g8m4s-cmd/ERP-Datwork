import { api } from '../api/client.ts'; // Importa a nossa instância do Axios

export interface ViaCEPResponse {
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

export async function fetchAddressByCEP(cep: string): Promise<ViaCEPResponse | null> {
  const cleanCEP = cep.replace(/\D/g, '');
  if (cleanCEP.length !== 8) return null;

  try {
    // ✨ Bate no nosso próprio backend, eliminando o erro 'Failed to fetch'
    const response = await api.get<ViaCEPResponse>(`/cep/${cleanCEP}`);
    
    if (response.data.erro) {
      console.warn(`[CEP] O CEP "${cleanCEP}" não existe.`);
      return null;
    }
    
    return response.data;
  } catch (error) {
    console.error('⚠️ Falha ao consultar o CEP através do Proxy do Servidor:', error);
    return null;
  }
}
