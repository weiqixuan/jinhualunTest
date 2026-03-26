import { Alert, App as AntApp, Button, Card, Drawer, Empty, Input, List, Skeleton, Space, Tag, Typography } from "antd";
import { useMemo, useState } from "react";
import { queryAgent } from "../../services/agentQueryService";
import { AgentClientRecord, AgentHoldingRecord, AgentQueryResult, AgentResultRecord } from "./types";

const EXAMPLE_QUESTIONS = [
  "张总持有哪些债券型产品？",
  "稳健增长一号被哪些客户持有？",
  "上个月新增了几个客户？",
  "张总最近有哪些跟进记录？"
];

interface AgentQueryPanelProps {
  open: boolean;
  onClose: () => void;
}

function formatAmount(amount: number | null) {
  if (amount === null) {
    return "-";
  }

  return `${amount.toLocaleString("zh-CN")} 万`;
}

function renderRecordMeta(record: AgentResultRecord) {
  if (record.kind === "holding") {
    const holdingRecord = record as AgentHoldingRecord;

    return {
      title: holdingRecord.productName,
      description: `${holdingRecord.productType} · ${holdingRecord.productStatus} · ${holdingRecord.positionStatus}`
    };
  }

  if (record.kind === "client") {
    const clientRecord = record as AgentClientRecord;

    return {
      title: clientRecord.clientName,
      description: clientRecord.productName
        ? `${clientRecord.company} · ${clientRecord.owner} · ${clientRecord.productName}`
        : `${clientRecord.company} · ${clientRecord.owner}`
    };
  }

  return {
    title: `${record.clientName} · ${record.date}`,
    description: `${record.channel} · ${record.relatedProductNames.join("、") || "未关联产品"}`
  };
}

export function AgentQueryPanel({ open, onClose }: AgentQueryPanelProps) {
  const { message } = AntApp.useApp();
  const [question, setQuestion] = useState("");
  const [querying, setQuerying] = useState(false);
  const [result, setResult] = useState<AgentQueryResult | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const orderedWarnings = useMemo(() => result?.warnings ?? [], [result]);

  async function handleSubmit() {
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion) {
      message.warning("请先输入一个查询问题。");
      return;
    }

    setQuerying(true);
    setErrorMessage("");

    try {
      const nextResult = await queryAgent(trimmedQuestion);
      setResult(nextResult);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "智能查询暂时不可用，请稍后重试。");
    } finally {
      setQuerying(false);
    }
  }

  return (
    <Drawer
      title="智能查询"
      width={520}
      open={open}
      onClose={onClose}
      className="agent-query-drawer"
      destroyOnClose={false}
    >
      <div className="agent-query-panel">
        <Typography.Paragraph className="agent-query-copy">
          通过自然语言查询客户持仓、产品覆盖、跟进记录和新增客户统计。当前版本使用 Mock Agent 基于业务快照做规则解析，不调用大模型。
        </Typography.Paragraph>

        <Card className="agent-query-card" variant="borderless">
          <Space direction="vertical" size={14} className="agent-query-form">
            <div>
              <Typography.Text strong>示例问题</Typography.Text>
              <div className="agent-query-example-list">
                {EXAMPLE_QUESTIONS.map((example) => (
                  <Button key={example} size="small" onClick={() => setQuestion(example)}>
                    {example}
                  </Button>
                ))}
              </div>
            </div>

            <Input.TextArea
              rows={4}
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="例如：张总持有哪些债券型产品？"
              maxLength={160}
              showCount
            />

            <Space wrap>
              <Button type="primary" onClick={() => void handleSubmit()} loading={querying}>
                开始查询
              </Button>
              <Button
                onClick={() => {
                  setQuestion("");
                  setResult(null);
                  setErrorMessage("");
                }}
                disabled={querying}
              >
                清空
              </Button>
            </Space>
          </Space>
        </Card>

        {querying && (
          <Card className="agent-query-card" variant="borderless">
            <Skeleton active title={{ width: "32%" }} paragraph={{ rows: 8 }} />
          </Card>
        )}

        {!querying && errorMessage && (
          <Alert
            className="agent-query-alert"
            type="error"
            showIcon
            message="查询失败"
            description={errorMessage}
          />
        )}

        {!querying && !result && !errorMessage && (
          <Card className="agent-query-card" variant="borderless">
            <Empty description="输入问题后即可发起智能查询" />
          </Card>
        )}

        {!querying && result && (
          <Space direction="vertical" size={14} className="agent-query-results">
            <Card className="agent-query-card" variant="borderless">
              <Space direction="vertical" size={12} style={{ width: "100%" }}>
                <div className="agent-query-answer-header">
                  <Typography.Text className="section-eyebrow">Query Result</Typography.Text>
                  <Tag color="geekblue">Mock Agent</Tag>
                </div>
                <Typography.Title level={4} className="agent-query-answer">
                  {result.answer}
                </Typography.Title>
                {orderedWarnings.map((warning) => (
                  <Alert
                    key={warning}
                    className="agent-query-alert"
                    type="warning"
                    showIcon
                    message={warning}
                  />
                ))}
              </Space>
            </Card>

            <Card className="agent-query-card" variant="borderless">
              <Space direction="vertical" size={12} style={{ width: "100%" }}>
                <Typography.Text strong>解析过程</Typography.Text>

                <div className="agent-query-trace-block">
                  <Typography.Text type="secondary">归一化问题</Typography.Text>
                  <Typography.Paragraph className="agent-query-trace-question">
                    {result.trace.normalizedQuestion}
                  </Typography.Paragraph>
                </div>

                <div className="agent-query-trace-block">
                  <Typography.Text type="secondary">识别意图</Typography.Text>
                  <div className="agent-query-filter-list">
                    <Tag color="blue">{result.trace.matchedIntent}</Tag>
                  </div>
                </div>

                {result.trace.matchedEntities.length > 0 && (
                  <div className="agent-query-trace-block">
                    <Typography.Text type="secondary">命中实体</Typography.Text>
                    <div className="agent-query-filter-list">
                      {result.trace.matchedEntities.map((entity) => (
                        <Tag key={`${entity.label}-${entity.value}`}>
                          {entity.label}：{entity.value}
                        </Tag>
                      ))}
                    </div>
                  </div>
                )}

                <div className="agent-query-trace-block">
                  <Typography.Text type="secondary">应用规则</Typography.Text>
                  <div className="agent-query-trace-rule-list">
                    {result.trace.appliedRules.map((rule) => (
                      <Typography.Paragraph key={rule} className="agent-query-trace-rule">
                        {rule}
                      </Typography.Paragraph>
                    ))}
                  </div>
                </div>
              </Space>
            </Card>

            {result.appliedFilters.length > 0 && (
              <Card className="agent-query-card" variant="borderless">
                <Typography.Text strong>应用条件</Typography.Text>
                <div className="agent-query-filter-list">
                  {result.appliedFilters.map((filter) => (
                    <Tag key={`${filter.label}-${filter.value}`}>
                      {filter.label}：{filter.value}
                    </Tag>
                  ))}
                </div>
              </Card>
            )}

            {result.summary.length > 0 && (
              <div className="agent-query-summary-grid">
                {result.summary.map((metric) => (
                  <Card key={metric.label} className="agent-query-summary-card" variant="borderless">
                    <Typography.Text className="agent-query-summary-label">{metric.label}</Typography.Text>
                    <strong className="agent-query-summary-value">{metric.value}</strong>
                  </Card>
                ))}
              </div>
            )}

            <Card className="agent-query-card" variant="borderless">
              <Typography.Text strong>结构化结果</Typography.Text>
              {result.records.length === 0 ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={result.reason ?? "当前没有命中记录"}
                />
              ) : (
                <List
                  className="agent-query-record-list"
                  dataSource={result.records}
                  renderItem={(record) => {
                    const meta = renderRecordMeta(record);

                    return (
                      <List.Item
                        extra={
                          record.kind === "follow_up" ? (
                            <Typography.Text type="secondary">{record.date}</Typography.Text>
                          ) : (
                            <Typography.Text strong>{formatAmount("amount" in record ? record.amount : null)}</Typography.Text>
                          )
                        }
                      >
                        <List.Item.Meta
                          title={meta.title}
                          description={
                            <Space direction="vertical" size={4}>
                              <Typography.Text type="secondary">{meta.description}</Typography.Text>
                              {record.kind === "follow_up" && (
                                <Typography.Paragraph className="agent-query-follow-up-copy">
                                  {record.content}
                                </Typography.Paragraph>
                              )}
                            </Space>
                          }
                        />
                      </List.Item>
                    );
                  }}
                />
              )}
            </Card>
          </Space>
        )}
      </div>
    </Drawer>
  );
}
