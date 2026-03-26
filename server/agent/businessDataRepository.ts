import { mockClients } from "../../src/mock/clients";
import { mockFollowUps } from "../../src/mock/followUps";
import { mockHoldings } from "../../src/mock/holdings";
import { mockProducts } from "../../src/mock/products";
import { BusinessDataRepository, BusinessDataSnapshot } from "./businessData.types";

function cloneSnapshot(): BusinessDataSnapshot {
  return {
    products: mockProducts.map((product) => ({
      ...product,
      tags: [...product.tags],
      sellingPoints: [...product.sellingPoints]
    })),
    clients: mockClients.map((client) => ({
      ...client
    })),
    holdings: mockHoldings.map((holding) => ({
      ...holding
    })),
    followUps: mockFollowUps.map((record) => ({
      ...record,
      relatedProductIds: [...record.relatedProductIds]
    }))
  };
}

export class StaticBusinessDataRepository implements BusinessDataRepository {
  async getSnapshot(): Promise<BusinessDataSnapshot> {
    return cloneSnapshot();
  }
}
