import type { Client } from "../../src/domain/client";
import type { FollowUpRecord } from "../../src/domain/followUp";
import type { Holding } from "../../src/domain/holding";
import type { Product } from "../../src/domain/product";

export interface BusinessDataSnapshot {
  products: Product[];
  clients: Client[];
  holdings: Holding[];
  followUps: FollowUpRecord[];
}

export interface BusinessDataRepository {
  getSnapshot(): Promise<BusinessDataSnapshot>;
}
