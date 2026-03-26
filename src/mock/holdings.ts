import { Holding } from "../domain/holding";

export const mockHoldings: Holding[] = [
  { holdingId: "H-1001", clientId: "C-1001", productId: "P-1001", amount: 850, positionStatus: "持有中" },
  { holdingId: "H-1002", clientId: "C-1001", productId: "P-1006", amount: 420, positionStatus: "持有中" },
  { holdingId: "H-1003", clientId: "C-1002", productId: "P-1003", amount: 300, positionStatus: "意向中" },
  { holdingId: "H-1004", clientId: "C-1002", productId: "P-1005", amount: 520, positionStatus: "持有中" },
  { holdingId: "H-1005", clientId: "C-1003", productId: "P-1005", amount: 180, positionStatus: "持有中" },
  { holdingId: "H-1006", clientId: "C-1004", productId: "P-1004", amount: 760, positionStatus: "持有中" },
  { holdingId: "H-1007", clientId: "C-1004", productId: "P-1008", amount: 260, positionStatus: "意向中" },
  { holdingId: "H-1008", clientId: "C-1005", productId: "P-1002", amount: 430, positionStatus: "持有中" },
  { holdingId: "H-1009", clientId: "C-1006", productId: "P-1007", amount: 150, positionStatus: "已赎回" },
  { holdingId: "H-1010", clientId: "C-1007", productId: "P-1009", amount: 680, positionStatus: "持有中" },
  { holdingId: "H-1011", clientId: "C-1008", productId: "P-1001", amount: 540, positionStatus: "持有中" },
  { holdingId: "H-1012", clientId: "C-1008", productId: "P-1002", amount: 390, positionStatus: "持有中" }
];
