import { Alert, Card, Tabs, Typography } from "antd";
import { useEffect, useState } from "react";
import { AuthApiError, loginUser, registerUser } from "../../services/authService";
import { AuthForm } from "./components/AuthForm";
import { AuthFieldError, AuthFormValues, AuthMode, AuthUser, RegisterValues } from "./types";

interface AuthPageProps {
  bootstrapErrorMessage?: string;
  onAuthenticated: (user: AuthUser) => void;
}

function toErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "当前无法连接认证服务，请稍后重试。";
}

export function AuthPage({ bootstrapErrorMessage = "", onAuthenticated }: AuthPageProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<AuthFieldError[]>([]);

  async function handleSubmit(values: AuthFormValues) {
    setSubmitting(true);
    setErrorMessage("");
    setFieldErrors([]);

    try {
      const user =
        mode === "login"
          ? await loginUser({
              email: values.email,
              password: values.password
            })
          : await registerUser({
              email: values.email,
              password: values.password,
              displayName: (values.displayName ?? "").trim()
            } as RegisterValues);

      onAuthenticated(user);
    } catch (error) {
      if (error instanceof AuthApiError) {
        setErrorMessage(error.message);
        setFieldErrors(error.fieldErrors);
      } else {
        setErrorMessage(toErrorMessage(error));
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-shell">
      <Card className="auth-card" variant="borderless">
        <Typography.Text className="section-eyebrow">认证扩展</Typography.Text>
        <Typography.Title level={2} className="auth-card-title">
          登录后进入资管销售工作台
        </Typography.Title>
        <Typography.Paragraph className="auth-card-copy">
          当前版本先接入最小可用的注册、登录与会话恢复能力，不影响既有的产品货架、客户管理和 Dashboard 工作流。
        </Typography.Paragraph>

        {bootstrapErrorMessage && (
          <Alert
            type="warning"
            showIcon
            className="auth-bootstrap-alert"
            message="认证服务暂时不可用"
            description={bootstrapErrorMessage}
          />
        )}

        <Tabs
          activeKey={mode}
          onChange={(nextMode) => {
            setMode(nextMode as AuthMode);
            setErrorMessage("");
            setFieldErrors([]);
          }}
          items={[
            {
              key: "login",
              label: "登录",
              children: (
                <AuthForm
                  mode="login"
                  submitting={submitting}
                  errorMessage={errorMessage}
                  fieldErrors={fieldErrors}
                  onSubmit={handleSubmit}
                />
              )
            },
            {
              key: "register",
              label: "注册",
              children: (
                <AuthForm
                  mode="register"
                  submitting={submitting}
                  errorMessage={errorMessage}
                  fieldErrors={fieldErrors}
                  onSubmit={handleSubmit}
                />
              )
            }
          ]}
        />
      </Card>
    </main>
  );
}
