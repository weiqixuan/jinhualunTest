export type ProductType = "股票型" | "债券型" | "混合型" | "指数型";

export type ProductStatus = "募集中" | "运作中" | "已清盘";

export type RiskLevel = "R2" | "R3" | "R4" | "R5";

export interface Product {
  id: string;
  name: string;
  type: ProductType;
  nav: number;
  aum: number;
  status: ProductStatus;
  riskLevel: RiskLevel;
  manager: string;
  inceptionDate: string;
  currency: string;
  tags: string[];
  investmentFocus: string;
  sellingPoints: string[];
}

export const productTypes: ProductType[] = ["股票型", "债券型", "混合型", "指数型"];

export const productStatuses: ProductStatus[] = ["募集中", "运作中", "已清盘"];
