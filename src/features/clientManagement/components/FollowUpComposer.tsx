import { Button, Form, Input, Select, Space, Typography } from "antd";
import { followUpChannels, FollowUpChannel, NewFollowUpInput } from "../../../domain/followUp";

interface FollowUpComposerProps {
  clientId: string;
  productOptions: Array<{ label: string; value: string }>;
  submitting: boolean;
  onSubmit: (input: NewFollowUpInput) => Promise<void>;
}

interface FollowUpFormValues {
  date: string;
  channel: FollowUpChannel;
  content: string;
  relatedProductIds: string[];
}

function getTodayString() {
  const now = new Date();
  const timezoneOffsetMs = now.getTimezoneOffset() * 60 * 1000;

  return new Date(now.getTime() - timezoneOffsetMs).toISOString().slice(0, 10);
}

export function FollowUpComposer({ clientId, productOptions, submitting, onSubmit }: FollowUpComposerProps) {
  const [form] = Form.useForm<FollowUpFormValues>();

  async function handleFinish(values: FollowUpFormValues) {
    try {
      await onSubmit({
        clientId,
        date: values.date,
        channel: values.channel,
        content: values.content.trim(),
        relatedProductIds: values.relatedProductIds ?? []
      });

      form.setFieldsValue({
        date: getTodayString(),
        channel: "电话",
        content: "",
        relatedProductIds: []
      });
    } catch {
      // Preserve the user's input so failed submissions can be retried directly.
    }
  }

  return (
    <div className="follow-up-composer">
      <Typography.Title level={5}>新增跟进记录</Typography.Title>
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          date: getTodayString(),
          channel: "电话",
          content: "",
          relatedProductIds: []
        }}
        onFinish={(values) => void handleFinish(values)}
      >
        <Space orientation="vertical" size={12} style={{ display: "flex" }}>
          <Form.Item<FollowUpFormValues> label="跟进日期" name="date" rules={[{ required: true, message: "请选择跟进日期" }]}>
            <Input type="date" size="large" />
          </Form.Item>

          <Form.Item<FollowUpFormValues> label="沟通渠道" name="channel" rules={[{ required: true, message: "请选择沟通渠道" }]}>
            <Select
              size="large"
              options={followUpChannels.map((channel) => ({ label: channel, value: channel }))}
            />
          </Form.Item>

          <Form.Item<FollowUpFormValues>
            label="关联产品"
            name="relatedProductIds"
            extra="可选，用于说明本次跟进涉及的基金产品。"
          >
            <Select mode="multiple" allowClear size="large" options={productOptions} placeholder="选择关联产品" />
          </Form.Item>

          <Form.Item<FollowUpFormValues>
            label="跟进内容"
            name="content"
            rules={[
              { required: true, message: "请输入跟进内容" },
              { min: 8, message: "请至少填写 8 个字符" }
            ]}
          >
            <Input.TextArea rows={4} placeholder="记录客户反馈、后续动作与关注产品" />
          </Form.Item>

          <Button type="primary" htmlType="submit" size="large" loading={submitting}>
            提交跟进
          </Button>
        </Space>
      </Form>
    </div>
  );
}
