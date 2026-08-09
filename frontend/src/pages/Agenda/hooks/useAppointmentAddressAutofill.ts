import { useEffect } from 'react';
import { CustomLogger } from '../../../utils/CustomLogger.ts';

interface UseAppointmentAddressAutofillOptions {
  cep: string;
  setStreet: (value: string) => void;
  setNeighborhood: (value: string) => void;
  setCity: (value: string) => void;
  setState: (value: string) => void;
}

export function useAppointmentAddressAutofill({
  cep,
  setStreet,
  setNeighborhood,
  setCity,
  setState
}: UseAppointmentAddressAutofillOptions) {
  useEffect(() => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;

    let active = true;
    void (async () => {
      try {
        const { fetchAddressByCEP } = await import('../../../utils/cep.ts');
        const address = await fetchAddressByCEP(cleanCep);
        if (!active || !address) return;
        setStreet(address.logradouro || '');
        setNeighborhood(address.bairro || '');
        setCity(address.localidade || '');
        setState(address.uf || '');
      } catch (error) {
        CustomLogger.warn(`[Agenda] CEP lookup failed for ${cleanCep}`, error);
      }
    })();

    return () => {
      active = false;
    };
  }, [cep, setCity, setNeighborhood, setState, setStreet]);
}
