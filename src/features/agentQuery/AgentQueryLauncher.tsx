import { FloatButton } from "antd";
import { useState } from "react";
import { AgentQueryPanel } from "./AgentQueryPanel";

function AgentAssistantIcon() {
  return (
    <span className="agent-query-float-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" focusable="false">
        <path
          d="M12 3.5V6"
          pathLength="1"
        />
        <circle cx="12" cy="2.5" r="1.25" />
        <rect x="5.5" y="7" width="13" height="10" rx="4.2" pathLength="1" />
        <path d="M8.5 19.5h7" pathLength="1" />
        <path d="M9.5 12h0.01" pathLength="1" />
        <path d="M14.5 12h0.01" pathLength="1" />
        <path d="M10 14.7c0.7 0.55 1.33 0.8 2 0.8s1.3-0.25 2-0.8" pathLength="1" />
        <path
          className="agent-query-float-spark"
          d="M18.75 5.1l0.42 1.15 1.15 0.42-1.15 0.42-0.42 1.15-0.42-1.15-1.15-0.42 1.15-0.42 0.42-1.15Z"
          pathLength="1"
        />
      </svg>
    </span>
  );
}

export function AgentQueryLauncher() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <FloatButton
        className="agent-query-float-button"
        tooltip="智能助手"
        onClick={() => setOpen(true)}
        icon={<AgentAssistantIcon />}
      />
      <AgentQueryPanel open={open} onClose={() => setOpen(false)} />
    </>
  );
}
