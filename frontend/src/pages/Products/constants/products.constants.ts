import { type GridColumn } from '../../../components/index.ts';
import { type Product } from '../../../types/product.ts';

export const PRODUCTS_TABLE_COLUMNS: GridColumn<Product>[] = [
    { header: 'Thumb', gridRatio: '56px', textAlign: 'center' },
    { header: 'SKU', gridRatio: '75px', textAlign: 'left' },
    { header: 'Nome / Marca', gridRatio: '1fr', textAlign: 'left' },
    { header: 'Custo Lote', gridRatio: '95px', textAlign: 'right' },
    { header: 'Un. Lote', gridRatio: '65px', textAlign: 'center' },
    { header: 'Custo Prod.', gridRatio: '95px', textAlign: 'right' },
    { header: 'Custo Total', gridRatio: '95px', textAlign: 'right' },
    { header: 'Curva', gridRatio: '64px', textAlign: 'center' },
    { header: 'Status', gridRatio: '64px', textAlign: 'center' }
];

export const PRODUCT_DEFAULT_FILTERS = {
    search: '',
    sortBy: 'custom',
    abcCategory: 'all',
    unitFilter: 'all'
} as const;
