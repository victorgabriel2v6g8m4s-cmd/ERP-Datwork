// 📦 frontend/src/components/index.ts
// Centraliza e re-exporta todos os blocos universais em um único barril

export { UniversalGridTable } from './UniversalGridTable.tsx';
export type { GridColumn } from './UniversalGridTable.tsx';

export { UniversalHeaderDashboard } from './UniversalHeaderDashboard.tsx';
export type { HeaderKpiCard, HeaderActionButton } from './UniversalHeaderDashboard.tsx';

export { SubTabSelector } from './SubTabSelector.tsx';
export { PricingMetricsBadges } from './PricingMetricsBadges.tsx';
export { GlobalTopTabs } from './GlobalTopTabs.tsx';
export { GlobalFooterNav } from './GlobalFooterNav.tsx';
export { UniversalSearchBar, type UniversalFilters } from './UniversalSearchBar.tsx';
export { UniversalRowItem } from './UniversalRowItem.tsx';
export { UniversalSubStatusSelect, SUB_STATUS_CATALOG, type SubStatusKey } from './UniversalSubStatusSelect.tsx';
