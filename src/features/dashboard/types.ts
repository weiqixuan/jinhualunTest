export interface DashboardSummary {
  onShelfProductCount: number;
  onShelfAum: number;
  activeClientCount: number;
  coreCoveredCount: number;
  coreClientCount: number;
  coreCoverageRate: number;
  followedClientCount: number;
  totalClientCount: number;
}

export interface DashboardHighlight {
  title: string;
  description: string;
}

export interface ProductTypeScaleItem {
  key: string;
  label: string;
  aum: number;
  productCount: number;
  share: number;
}

export interface ClientCoverageItem {
  clientId: string;
  clientName: string;
  owner: string;
  levelLabel: string;
  holdingAmount: number;
  holdingProductCount: number;
  lastFollowUpDate: string | null;
}

export interface ProductStatusDistributionItem {
  key: string;
  label: string;
  productCount: number;
  aum: number;
}

export interface DashboardViewModel {
  summary: DashboardSummary;
  highlights: DashboardHighlight[];
  productTypeScale: ProductTypeScaleItem[];
  clientCoverageRanking: ClientCoverageItem[];
  productStatusDistribution: ProductStatusDistributionItem[];
}
