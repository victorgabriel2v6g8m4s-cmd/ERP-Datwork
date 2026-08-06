export interface Expense {
    id: string;
    name: string;
    value: number;
    valueType: 'LITERAL' | 'PERCENT';
    category: 'FIXED' | 'VARIABLE';
    status: 'ACTIVE' | 'INACTIVE';
    position: number;
    createdAt: string;
    updatedAt: string;
}
