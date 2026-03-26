import { Holding } from "../domain/holding";
import { mockHoldings } from "../mock/holdings";

const SIMULATED_DELAY_MS = 820;

function wait(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export async function fetchHoldings(): Promise<Holding[]> {
  await wait(SIMULATED_DELAY_MS);
  return mockHoldings;
}
