import { type Request, type Response } from 'express';
// 🌟 Acoplamento direto com a instância centralizadora e enums do Prisma
import prismaClient from '../../../config/prisma.js';
import { ProductStatus } from '@prisma/client';
import { CustomLogger } from '../../../logger/CustomLogger.js';

export class ListRecipesController {
    async handle(req: Request, res: Response): Promise<Response> {
        CustomLogger.info('Recebendo requisição HTTP para carregar listagem geral de fichas técnicas');

        try {
            // ✨ Otimização e Segurança: Filtramos apenas as receitas que estão com status ACTIVE no banco
            const recipes = await prismaClient.recipe.findMany({
                where: {
                    status: ProductStatus.ACTIVE // ✨ Uso do Enum estrito do Schema
                },
                orderBy: {
                    position: 'asc'
                },
                include: {
                    product: {
                        select: {
                            sku: true,
                            name: true,
                            thumbnail: true,
                            abcCategory: true,
                            recipeCostPerUnit: true,
                            indirectCost: true,
                            totalUnitCost: true
                        }
                    },
                    items: {
                        include: {
                            ingredient: {
                                select: {
                                    name: true,
                                    price: true,
                                    quantity: true,
                                    unit: true
                                }
                            }
                        }
                    }
                }
            });

            return res.status(200).json(recipes);
        } catch (error) {
            CustomLogger.error('Erro crítico no Prisma ao carregar listagem de receitas na camada HTTP', error);
            return res.status(500).json({ error: 'Internal Server Error ao processar listagem de receitas.' });
        }
    }
}
