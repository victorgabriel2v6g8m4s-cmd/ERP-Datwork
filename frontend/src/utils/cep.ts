import { api } from '../api/client.ts';
import { APP_CONFIG } from '../config/app.config.ts';
import { CustomLogger } from './CustomLogger.ts';

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
    const response = await api.get<ViaCEPResponse>(APP_CONFIG.api.endpoints.utilities.cep(cleanCEP));
    
    if (response.data.erro) {
      CustomLogger.warn(`[CEP] CEP ${cleanCEP} was not found`);
      return null;
    }
    
    return response.data;
  } catch (error) {
    CustomLogger.error('[CEP] Failed to query address through the backend proxy', error);
    return null;
  }
}
