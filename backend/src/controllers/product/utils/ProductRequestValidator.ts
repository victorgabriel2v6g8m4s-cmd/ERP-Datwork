import { AbcCategory, CostInclusion, Prisma } from '@prisma/client';
import { type ProductMediaType } from '../../../contracts/product/ProductContract.js';

export class ProductRequestValidationError extends Error {
    constructor(
        public readonly field: string,
        message: string
    ) {
        super(message);
        this.name = 'ProductRequestValidationError';
    }
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseProductMediaType(value: unknown, index: number): ProductMediaType {
    if (value === 'image' || value === 'video' || value === 'document') {
        return value;
    }

    throw new ProductRequestValidationError('medias', `A mídia na posição ${index} possui tipo inválido.`);
}

export function parseRequiredNonEmptyString(value: unknown, field: string): string {
    if (typeof value !== 'string' || !value.trim()) {
        throw new ProductRequestValidationError(field, `O campo ${field} é obrigatório e deve ser um texto válido.`);
    }

    return value.trim();
}

export function parseOptionalNonEmptyString(value: unknown, field: string): string | undefined {
    if (value === undefined) return undefined;
    return parseRequiredNonEmptyString(value, field);
}

export function parseOptionalNullableString(value: unknown, field: string): string | null | undefined {
    if (value === undefined) return undefined;
    if (value === null) return null;

    if (typeof value !== 'string') {
        throw new ProductRequestValidationError(field, `O campo ${field} deve ser um texto válido ou nulo.`);
    }

    const normalized = value.trim();
    return normalized || null;
}

export function parseOptionalNonNegativeNumber(value: unknown, field: string): number | undefined {
    if (value === undefined) return undefined;
    if (typeof value === 'string' && !value.trim()) {
        throw new ProductRequestValidationError(field, `O campo ${field} deve ser um número válido.`);
    }

    const parsed = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(parsed) || parsed < 0) {
        throw new ProductRequestValidationError(field, `O campo ${field} deve ser um número maior ou igual a zero.`);
    }

    return parsed;
}

export function parseOptionalAbcCategory(value: unknown): AbcCategory | undefined {
    if (value === undefined) return undefined;

    if (typeof value !== 'string' || !Object.values(AbcCategory).includes(value as AbcCategory)) {
        throw new ProductRequestValidationError('abcCategory', 'A categoria ABC informada é inválida.');
    }

    return value as AbcCategory;
}

export function parseOptionalCostInclusion(value: unknown): CostInclusion | undefined {
    if (value === undefined) return undefined;

    if (typeof value !== 'string' || !Object.values(CostInclusion).includes(value as CostInclusion)) {
        throw new ProductRequestValidationError('includeFixedCosts', 'A configuração de custos fixos informada é inválida.');
    }

    return value as CostInclusion;
}

export function parseOptionalProductMedias(value: unknown): Prisma.InputJsonValue | undefined {
    if (value === undefined) return undefined;

    let parsed: unknown = value;
    if (typeof value === 'string') {
        try {
            parsed = JSON.parse(value) as unknown;
        } catch {
            throw new ProductRequestValidationError('medias', 'A lista de mídias contém JSON inválido.');
        }
    }

    if (!Array.isArray(parsed)) {
        throw new ProductRequestValidationError('medias', 'A lista de mídias deve ser um array válido.');
    }

    const normalized: Prisma.InputJsonObject[] = parsed.map((entry, index) => {
        if (!isRecord(entry)) {
            throw new ProductRequestValidationError('medias', `A mídia na posição ${index} possui estrutura inválida.`);
        }

        const id = parseRequiredNonEmptyString(entry.id, `medias[${index}].id`);
        const name = parseRequiredNonEmptyString(entry.name, `medias[${index}].name`);
        const url = parseRequiredNonEmptyString(entry.url, `medias[${index}].url`);
        const type = parseProductMediaType(entry.type, index);

        return { id, name, url, type };
    });

    return normalized;
}
