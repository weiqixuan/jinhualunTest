import { FollowUpRecord, NewFollowUpInput } from "../domain/followUp";
import { mockFollowUps } from "../mock/followUps";

const SIMULATED_DELAY_MS = 760;

let followUpStore: FollowUpRecord[] = [...mockFollowUps];
let shouldFailNextCreateFollowUp = false;

function wait(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function buildFollowUpId() {
  return `F-${Date.now()}`;
}

export async function fetchFollowUps(): Promise<FollowUpRecord[]> {
  await wait(SIMULATED_DELAY_MS);
  return [...followUpStore];
}

export async function createFollowUp(input: NewFollowUpInput): Promise<FollowUpRecord> {
  await wait(SIMULATED_DELAY_MS);

  if (shouldFailNextCreateFollowUp) {
    shouldFailNextCreateFollowUp = false;
    throw new Error("跟进记录提交失败，请稍后重试。");
  }

  const newRecord: FollowUpRecord = {
    id: buildFollowUpId(),
    ...input
  };

  followUpStore = [newRecord, ...followUpStore];

  return newRecord;
}

export function simulateNextCreateFollowUpFailure() {
  shouldFailNextCreateFollowUp = true;
}
