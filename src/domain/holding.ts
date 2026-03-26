export type PositionStatus = "持有中" | "意向中" | "已赎回";

export interface Holding {
  holdingId: string;
  clientId: string;
  productId: string;
  amount: number;
  positionStatus: PositionStatus;
}

export const positionStatuses: PositionStatus[] = ["持有中", "意向中", "已赎回"];
