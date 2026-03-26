import { FollowUpRecord } from "../domain/followUp";

export const mockFollowUps: FollowUpRecord[] = [
  {
    id: "F-1001",
    clientId: "C-1001",
    date: "2026-03-21",
    channel: "电话",
    content: "确认季度配置计划，客户继续看好稳健增长一号，要求补充最新回撤数据。",
    relatedProductIds: ["P-1001"]
  },
  {
    id: "F-1002",
    clientId: "C-1001",
    date: "2026-03-10",
    channel: "微信",
    content: "发送双债进取二号路演材料，客户希望对比同类二级债回撤表现。",
    relatedProductIds: ["P-1006"]
  },
  {
    id: "F-1003",
    clientId: "C-1002",
    date: "2026-03-22",
    channel: "面谈",
    content: "就均衡配置三年持有进行产品培训，客户考虑先做试点额度。",
    relatedProductIds: ["P-1003"]
  },
  {
    id: "F-1004",
    clientId: "C-1002",
    date: "2026-03-14",
    channel: "邮件",
    content: "发送中证A500增强策略说明，客户转给内部投委会评估。",
    relatedProductIds: ["P-1005"]
  },
  {
    id: "F-1005",
    clientId: "C-1003",
    date: "2026-03-18",
    channel: "电话",
    content: "客户对指数增强感兴趣，但要求补充超额收益来源说明。",
    relatedProductIds: ["P-1005"]
  },
  {
    id: "F-1006",
    clientId: "C-1004",
    date: "2026-03-23",
    channel: "面谈",
    content: "讨论科创成长先锋与全球收益配置的组合方案，客户关注波动控制。",
    relatedProductIds: ["P-1004", "P-1008"]
  },
  {
    id: "F-1007",
    clientId: "C-1005",
    date: "2026-03-17",
    channel: "微信",
    content: "客户反馈景曜红利精选在渠道端接受度较高，计划安排下周联合路演。",
    relatedProductIds: ["P-1002"]
  },
  {
    id: "F-1008",
    clientId: "C-1007",
    date: "2026-03-20",
    channel: "电话",
    content: "现金管理优选续投意愿明确，客户希望确认额度安排。",
    relatedProductIds: ["P-1009"]
  },
  {
    id: "F-1009",
    clientId: "C-1008",
    date: "2026-03-19",
    channel: "面谈",
    content: "回顾核心客户覆盖情况，客户提出希望增加权益产品备选池。",
    relatedProductIds: ["P-1001", "P-1002"]
  }
];
