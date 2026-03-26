import { Client } from "../domain/client";
import { mockClients } from "../mock/clients";

const SIMULATED_DELAY_MS = 800;

let shouldFailNextClientsRequest = false;

function wait(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export async function fetchClients(): Promise<Client[]> {
  await wait(SIMULATED_DELAY_MS);

  if (shouldFailNextClientsRequest) {
    shouldFailNextClientsRequest = false;
    throw new Error("客户数据加载失败，请稍后重试。");
  }

  return mockClients;
}

export function simulateNextClientRequestFailure() {
  shouldFailNextClientsRequest = true;
}
