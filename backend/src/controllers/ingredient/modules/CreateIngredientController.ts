import { type Request, type Response } from 'express';
// 🌟 Acoplamento direto com a instância centralizadora de serviços do módulo de insumos
import { ingredientService } from '../../../services/ingredient/IngredientServiceHandler.js';
import { CustomLogger } from '../../../logger/CustomLogger.js';

export class CreateIngredientController {
  async handle(req: Request, res: Response): Promise<Response> {
    CustomLogger.info('Recebendo requisição HTTP para criação de novo insumo patrimonial');

    const { sku, name, price, quantity, unit, thumbnail } = req.body;

    // Validação defensiva na camada de entrada HTTP
    if (!sku || !name || price === undefined || quantity === undefined || !unit) {
      CustomLogger.warn('Tentativa de criação de insumo rejeitada: campos obrigatórios ausentes');
      return res.status(400).json({ error: 'Os campos SKU, Nome, Preço, Quantidade e Unidade são obrigatórios.' });
    }

    try {
      // 🛠️ Monta o payload dinamicamente para respeitar a regra rígida exactOptionalPropertyTypes: true
      const payload: any = {
        sku,
        name,
        price: Number(price),
        quantity: Number(quantity),
        unit
      };

      if (thumbnail !== undefined) payload.thumbnail = thumbnail;

      // ✨ Otimização: Consome direto do Handler centralizado, sem overhead de "new CreateIngredientService()"
      const ingredient = await ingredientService.create.execute(payload);

      return res.status(201).json(ingredient);
    } catch (error: any) {
      // Interceptação de código do Prisma mapeado de forma defensiva para chaves únicas (SKU @unique)
      if (error.code === 'P2002') {
        CustomLogger.warn(`Cadastro rejeitado na camada HTTP: SKU de insumo ${sku} já cadastrado`);
        return res.status(400).json({ error: 'Já existe um insumo registrado no ERP com este SKU.' });
      }

      CustomLogger.error('Erro crítico não tratado ao registrar novo insumo', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}
