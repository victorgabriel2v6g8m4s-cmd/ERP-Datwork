import { Router } from 'express';

const utilRouter = Router();

utilRouter.get('/cep/:cep', async (req, res) => {
    const { cep } = req.params;
    const cleanCEP = cep.replace(/\D/g, '');

    if (cleanCEP.length !== 8) {
        return res.status(400).json({ error: 'CEP inválido. Deve conter 8 dígitos.' });
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000); // 4 segundos de timeout

        const response = await fetch(`https://viacep.com.br{cleanCEP}/json/`, {
            method: 'GET',
            signal: controller.signal,
            headers: {
                'User-Agent': 'ERP_System/1.0',
                'Accept': 'application/json'
            }
        });

        clearTimeout(timeoutId);

        if (!response.ok) throw new Error(`ViaCEP falhou com status: ${response.status}`);

        const data = await response.json();
        return res.status(200).json(data);

    } catch (error: any) {
        console.error('🔥 [ERRO PROXY CEP]:', error.message);
        return res.status(500).json({ error: 'Erro de conexão com o serviço externo de CEP.' });
    }
});

export { utilRouter };
