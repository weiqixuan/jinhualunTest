import { Product } from "../domain/product";
import { mockProducts } from "../mock/products";

const SIMULATED_DELAY_MS = 900;

let shouldFailNextRequest = false;

function wait(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export async function fetchProducts(): Promise<Product[]> {
  await wait(SIMULATED_DELAY_MS);

  if (shouldFailNextRequest) {
    shouldFailNextRequest = false;
    throw new Error("产品数据加载失败，请稍后重试。");
  }

  return mockProducts;
}

export function simulateNextProductsRequestFailure() {
  shouldFailNextRequest = true;
}
