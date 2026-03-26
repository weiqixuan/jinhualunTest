export type FollowUpChannel = "电话" | "微信" | "面谈" | "邮件";

export interface FollowUpRecord {
  id: string;
  clientId: string;
  date: string;
  channel: FollowUpChannel;
  content: string;
  relatedProductIds: string[];
}

export interface NewFollowUpInput {
  clientId: string;
  date: string;
  channel: FollowUpChannel;
  content: string;
  relatedProductIds: string[];
}

export const followUpChannels: FollowUpChannel[] = ["电话", "微信", "面谈", "邮件"];
