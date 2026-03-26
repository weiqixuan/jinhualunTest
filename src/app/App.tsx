import { App as AntApp, Card, ConfigProvider, Skeleton } from "antd";
import { useEffect, useState } from "react";
import { AuthPage } from "../features/auth/AuthPage";
import { AuthUser } from "../features/auth/types";
import { fetchCurrentUser, logoutUser } from "../services/authService";
import { WorkspaceShell } from "./WorkspaceShell";

type AuthStatus = "checking" | "authenticated" | "guest";
const SESSION_BOOTSTRAP_RETRIES = 5;
const SESSION_BOOTSTRAP_RETRY_DELAY_MS = 400;

function wait(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function AppContent() {
  const { message } = AntApp.useApp();
  const [authStatus, setAuthStatus] = useState<AuthStatus>("checking");
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [bootstrapErrorMessage, setBootstrapErrorMessage] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    void restoreSession();
  }, []);

  async function restoreSession() {
    setAuthStatus("checking");
    setBootstrapErrorMessage("");

    for (let attempt = 0; attempt < SESSION_BOOTSTRAP_RETRIES; attempt += 1) {
      try {
        const user = await fetchCurrentUser();

        if (user) {
          setCurrentUser(user);
          setAuthStatus("authenticated");
          return;
        }

        setCurrentUser(null);
        setAuthStatus("guest");
        return;
      } catch (error) {
        const isLastAttempt = attempt === SESSION_BOOTSTRAP_RETRIES - 1;

        if (isLastAttempt) {
          setCurrentUser(null);
          setAuthStatus("guest");
          setBootstrapErrorMessage(error instanceof Error ? error.message : "当前无法连接认证服务，请稍后重试。");
          return;
        }

        await wait(SESSION_BOOTSTRAP_RETRY_DELAY_MS);
      }
    }
  }

  async function handleAuthenticated(user: AuthUser) {
    setCurrentUser(user);
    setBootstrapErrorMessage("");
    setAuthStatus("authenticated");
    message.success("登录成功，已进入工作台。");
  }

  async function handleLogout() {
    setLoggingOut(true);

    try {
      await logoutUser();
      setCurrentUser(null);
      setAuthStatus("guest");
      message.success("已退出登录。");
    } catch (error) {
      message.error(error instanceof Error ? error.message : "退出登录失败，请稍后重试。");
    } finally {
      setLoggingOut(false);
    }
  }

  if (authStatus === "checking") {
    return (
      <main className="workspace-shell">
        <Card className="workspace-header-card" variant="borderless">
          <Skeleton active title={{ width: "28%" }} paragraph={{ rows: 10 }} />
        </Card>
      </main>
    );
  }

  if (authStatus === "authenticated" && currentUser) {
    return <WorkspaceShell currentUser={currentUser} loggingOut={loggingOut} onLogout={() => void handleLogout()} />;
  }

  return (
    <AuthPage bootstrapErrorMessage={bootstrapErrorMessage} onAuthenticated={handleAuthenticated} />
  );
}

export function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#0f6c81",
          colorInfo: "#0f6c81",
          colorBgLayout: "#edf3f6",
          colorText: "#16232c",
          colorTextSecondary: "#5a7080",
          colorBorderSecondary: "#d8e2e8",
          borderRadius: 18,
          fontFamily: '"Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif',
          boxShadowTertiary: "0 18px 36px rgba(21, 44, 58, 0.08)"
        }
      }}
    >
      <AntApp>
        <AppContent />
      </AntApp>
    </ConfigProvider>
  );
}
