import { Client } from "../domain/client";

export const mockClients: Client[] = [
  {
    id: "C-1001",
    name: "张总",
    level: "核心",
    createdAt: "2025-12-12",
    contact: "138-1024-7812",
    company: "华融证券财富管理部",
    owner: "周伟",
    region: "上海",
    organizationType: "券商",
    notes: "偏好固收增强与稳健类配置，对净值波动较敏感。"
  },
  {
    id: "C-1002",
    name: "李总",
    level: "重点",
    createdAt: "2026-01-08",
    contact: "139-2218-6635",
    company: "恒远银行私人银行",
    owner: "陈晨",
    region: "北京",
    organizationType: "银行",
    notes: "关注新发产品窗口期，偏好组合逻辑讲解清晰的路演材料。"
  },
  {
    id: "C-1003",
    name: "王总",
    level: "观察",
    createdAt: "2026-02-03",
    contact: "136-8871-5092",
    company: "海晟保险资管",
    owner: "周伟",
    region: "深圳",
    organizationType: "保险",
    notes: "正在评估指数增强产品，尚未形成稳定持仓。"
  },
  {
    id: "C-1004",
    name: "赵总",
    level: "核心",
    createdAt: "2026-02-16",
    contact: "137-6652-4108",
    company: "嘉信家族办公室",
    owner: "林越",
    region: "杭州",
    organizationType: "家办",
    notes: "高净值客户代表，接受全球配置与主题成长产品。"
  },
  {
    id: "C-1005",
    name: "孙总",
    level: "重点",
    createdAt: "2026-02-24",
    contact: "135-9440-1186",
    company: "诚泰基金销售",
    owner: "陈晨",
    region: "广州",
    organizationType: "第三方销售",
    notes: "重视产品故事与销售话术，关注近期成交转化。"
  },
  {
    id: "C-1006",
    name: "何总",
    level: "观察",
    createdAt: "2026-03-02",
    contact: "158-3370-2024",
    company: "天裕信托",
    owner: "林越",
    region: "成都",
    organizationType: "信托",
    notes: "以审慎评估为主，倾向先小额度试投。"
  },
  {
    id: "C-1007",
    name: "顾总",
    level: "重点",
    createdAt: "2026-03-09",
    contact: "186-7742-9501",
    company: "安睿理财子公司",
    owner: "周伟",
    region: "南京",
    organizationType: "理财子",
    notes: "对短债和现金管理类配置需求稳定。"
  },
  {
    id: "C-1008",
    name: "陈总",
    level: "核心",
    createdAt: "2026-03-18",
    contact: "188-9301-6627",
    company: "远景资产配置中心",
    owner: "陈晨",
    region: "苏州",
    organizationType: "财富管理",
    notes: "关注客户覆盖效率，希望快速看到持仓与跟进脉络。"
  }
];
