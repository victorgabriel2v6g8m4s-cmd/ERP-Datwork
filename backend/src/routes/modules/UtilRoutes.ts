import { Router } from 'express';
import { SERVER_CONFIG } from '../../config/serverConfig.js';
import { CustomLogger } from '../../logger/CustomLogger.js';

interface ViaCepResponse {
    logradouro?: unknown;
    bairro?: unknown;
    localidade?: unknown;
    uf?: unknown;
    erro?: unknown;
}

function isViaCepResponse(value: unknown): value is ViaCepResponse {
    return typeof value === 'object' && value !== null;
}

const utilRouter = Router();

utilRouter.get('/cep/:cep', async (req, res) => {
    const { cep } = req.params;
    const cleanCEP = cep.replace(/\D/g, '');

    if (cleanCEP.length !== 8) {
        return res.status(400).json({ error: 'CEP inválido. Deve conter 8 dígitos.' });
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(
            () => controller.abort(),
            SERVER_CONFIG.externalServices.viaCep.timeoutMs
        );

        try {
            const response = await fetch(
                `${SERVER_CONFIG.externalServices.viaCep.baseUrl}/${cleanCEP}/json/`,
                {
                    method: 'GET',
                    signal: controller.signal,
                    headers: {
                        'User-Agent': 'ERP-Datwork/1.0',
                        'Accept': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`ViaCepHttpStatus:${response.status}`);
            }

            const data: unknown = await response.json();
            if (!isViaCepResponse(data)) {
                throw new Error('ViaCepInvalidResponse');
            }

            return res.status(200).json(data);
        } finally {
            clearTimeout(timeoutId);
        }
    } catch (error: unknown) {
        const timedOut = error instanceof Error && error.name === 'AbortError';
        CustomLogger.error('[CEP] External lookup failed', error);
        return res.status(timedOut ? 504 : 502).json({
            error: timedOut ? 'CepServiceTimeout' : 'CepServiceUnavailable'
        });
    }
});

export { utilRouter };
