import { Client } from "../../domain/client";
import { FollowUpRecord } from "../../domain/followUp";
import { Holding } from "../../domain/holding";
import { Product } from "../../domain/product";

export interface ClientListItem extends Client {
  activeHoldingCount: number;
  totalHoldingAmount: number;
  lastFollowUpDate: string | null;
  relatedProductNames: string[];
}

export interface EnrichedHolding extends Holding {
  product: Product | null;
}

export interface EnrichedFollowUpRecord extends FollowUpRecord {
  relatedProducts: Product[];
}

export interface ClientProfile {
  client: Client;
  holdings: EnrichedHolding[];
  followUps: EnrichedFollowUpRecord[];
  totalHoldingAmount: number;
  activeHoldingCount: number;
  lastFollowUpDate: string | null;
}
