import { Alert, Button, Form, Input, Typography } from "antd";
import { useEffect } from "react";
import { AuthFieldError, AuthFormValues, AuthMode } from "../types";

interface AuthFormProps {
  mode: AuthMode;
  submitting: boolean;
  errorMessage: string;
  fieldErrors: AuthFieldError[];
  onSubmit: (values: AuthFormValues) => Promise<void>;
}

type AuthFieldName = "displayName" | "email" | "password";

function getFieldNames(mode: AuthMode): AuthFieldName[] {
  return mode === "register" ? ["displayName", "email", "password"] : ["email", "password"];
}

function toFieldName(value: string): AuthFieldName | null {
  if (value === "displayName" || value === "email" || value === "password") {
    return value;
  }

  return null;
}

export function AuthForm({ mode, submitting, errorMessage, fieldErrors, onSubmit }: AuthFormProps) {
  const [form] = Form.useForm<AuthFormValues>();

  useEffect(() => {
    const fieldNames = getFieldNames(mode);

    form.setFields(
      fieldNames.map((name) => ({
        name: [name],
        errors: []
      }))
    );

    if (fieldErrors.length > 0) {
      form.setFields(
        fieldErrors
          .filter((fieldError) => fieldError.field !== "form")
          .map((fieldError) => {
            const fieldName = toFieldName(fieldError.field);

            if (!fieldName) {
              return null;
            }

            return {
              name: fieldName,
              errors: [fieldError.message]
            };
          })
          .filter((field): field is { name: AuthFieldName; errors: string[] } => field !== null)
      );
    }
  }, [fieldErrors, form, mode]);

  useEffect(() => {
    form.resetFields();
  }, [form, mode]);

  return (
    <Form<AuthFormValues> form={form} layout="vertical" className="auth-form" onFinish={(values) => void onSubmit(values)}>
      {errorMessage && (
        <Alert
          type="error"
          showIcon
          className="auth-form-alert"
          message={mode === "login" ? "登录失败" : "注册失败"}
          description={errorMessage}
        />
      )}

      {mode === "register" && (
        <Form.Item
          label="姓名"
          name="displayName"
          rules={[
            { required: true, message: "请输入姓名。" },
            { min: 2, message: "姓名至少 2 个字符。" },
            { max: 32, message: "姓名不能超过 32 个字符。" }
          ]}
        >
          <Input size="large" placeholder="例如：周倩" autoComplete="name" />
        </Form.Item>
      )}

      <Form.Item
        label="邮箱"
        name="email"
        rules={[
          { required: true, message: "请输入邮箱。" },
          { type: "email", message: "请输入有效邮箱地址。" }
        ]}
      >
        <Input size="large" placeholder="name@company.com" autoComplete="email" />
      </Form.Item>

      <Form.Item
        label="密码"
        name="password"
        rules={[
          { required: true, message: "请输入密码。" },
          { min: 8, message: "密码至少 8 位。" }
        ]}
      >
        <Input.Password size="large" placeholder="请输入密码" autoComplete={mode === "login" ? "current-password" : "new-password"} />
      </Form.Item>

      <Button type="primary" htmlType="submit" size="large" block loading={submitting}>
        {mode === "login" ? "登录并进入工作台" : "注册并进入工作台"}
      </Button>

      <Typography.Text className="auth-footnote">
        {mode === "login" ? "首次使用可切换到“注册”页创建演示账号。" : "注册成功后会自动进入当前业务工作台。"}
      </Typography.Text>
    </Form>
  );
}
