export function formatNav(value: number) {
  return value.toFixed(4);
}

export function formatAum(value: number) {
  return `${value.toFixed(1)} 亿元`;
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(new Date(value));
}

export function formatAmountInWan(value: number) {
  return `${new Intl.NumberFormat("zh-CN").format(value)} 万元`;
}
