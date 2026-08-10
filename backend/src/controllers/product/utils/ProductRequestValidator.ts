import { AbcCategory, CostInclusion, Prisma } from '@prisma/client';
import {
    type ProductMediaType,
    type ProductPositionInput
} from '../../../contracts/product/ProductContract.js';

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

    if (value === AbcCategory.A || value === AbcCategory.B || value === AbcCategory.C) {
        return value;
    }

    throw new ProductRequestValidationError('abcCategory', 'A categoria ABC informada é inválida.');
}

export function parseOptionalCostInclusion(value: unknown): CostInclusion | undefined {
    if (value === undefined) return undefined;

    if (
        value === CostInclusion.DEFAULT ||
        value === CostInclusion.YES ||
        value === CostInclusion.NO
    ) {
        return value;
    }

    throw new ProductRequestValidationError('includeFixedCosts', 'A configuração de custos fixos informada é inválida.');
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

export function parseProductPositions(value: unknown): ProductPositionInput[] {
    if (!isRecord(value) || !Array.isArray(value.positions) || value.positions.length === 0) {
        throw new ProductRequestValidationError('positions', 'A ordenação deve possuir ao menos uma posição.');
    }

    const ids = new Set<string>();
    const positions = new Set<number>();
    const parsed = value.positions.map((entry, index) => {
        if (!isRecord(entry)) {
            throw new ProductRequestValidationError(`positions.${index}`, 'A posição informada é inválida.');
        }

        const id = parseRequiredNonEmptyString(entry.id, `positions.${index}.id`);
        const position = typeof entry.position === 'number'
            ? entry.position
            : typeof entry.position === 'string' && entry.position.trim()
                ? Number(entry.position)
                : Number.NaN;

        if (!Number.isInteger(position) || position < 0) {
            throw new ProductRequestValidationError(
                `positions.${index}.position`,
                'A posição deve ser um inteiro maior ou igual a zero.'
            );
        }
        if (ids.has(id)) {
            throw new ProductRequestValidationError('positions', 'A ordenação contém IDs duplicados.');
        }
        if (positions.has(position)) {
            throw new ProductRequestValidationError('positions', 'A ordenação contém posições duplicadas.');
        }

        ids.add(id);
        positions.add(position);
        return { id, position };
    });

    const sortedPositions = [...positions].sort((left, right) => left - right);
    if (sortedPositions.some((position, index) => position !== index)) {
        throw new ProductRequestValidationError(
            'positions',
            'As posições devem formar uma sequência completa iniciada em zero.'
        );
    }

    return parsed;
}
