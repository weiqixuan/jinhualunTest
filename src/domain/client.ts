export type ClientLevel = "核心" | "重点" | "观察";

export interface Client {
  id: string;
  name: string;
  level: ClientLevel;
  createdAt: string;
  contact: string;
  company: string;
  owner: string;
  region: string;
  organizationType: string;
  notes: string;
}

export const clientLevels: ClientLevel[] = ["核心", "重点", "观察"];
