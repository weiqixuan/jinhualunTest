import { Button, Card, Skeleton, Space, Tabs, Typography } from "antd";
import { Suspense, lazy, useState } from "react";
import { AgentQueryLauncher } from "../features/agentQuery/AgentQueryLauncher";
import { AuthUser } from "../features/auth/types";
import { ClientManagementPage } from "../features/clientManagement/ClientManagementPage";
import { ProductShelfPage } from "../features/productShelf/ProductShelfPage";

const DashboardPage = lazy(async () => {
  const module = await import("../features/dashboard/DashboardPage");

  return { default: module.DashboardPage };
});

function DashboardLoadingFallback() {
  return (
    <Card className="shelf-feedback-card" variant="borderless">
      <Skeleton active title={{ width: "36%" }} paragraph={{ rows: 8 }} />
    </Card>
  );
}

interface WorkspaceShellProps {
  currentUser: AuthUser;
  loggingOut: boolean;
  onLogout: () => void;
}

export function WorkspaceShell({ currentUser, loggingOut, onLogout }: WorkspaceShellProps) {
  const [activeModule, setActiveModule] = useState("product-shelf");

  return (
    <>
      <main className="workspace-shell">
        <Card className="workspace-header-card" variant="borderless">
          <div className="workspace-top">
            <div>
              <Typography.Text className="section-eyebrow">jinhualunCode Demo</Typography.Text>
              <Typography.Title level={2} className="workspace-title">
                资管渠道销售内部工具
              </Typography.Title>
              <Typography.Paragraph className="workspace-copy">
                当前工作台已接入模块一“产品货架”、模块二“客户管理”、模块三“数据概览 Dashboard”，并补充了最小可用的登录注册服务与 Mock Agent 智能查询演示。
              </Typography.Paragraph>
            </div>

            <Space className="workspace-user-panel" size={[12, 12]} wrap>
              <div className="workspace-user-chip">
                <Typography.Text className="workspace-user-label">当前用户</Typography.Text>
                <strong>{currentUser.displayName}</strong>
                <Typography.Text className="workspace-user-email">{currentUser.email}</Typography.Text>
              </div>
              <Button size="large" onClick={onLogout} loading={loggingOut}>
                退出登录
              </Button>
            </Space>
          </div>

          <Tabs
            activeKey={activeModule}
            onChange={setActiveModule}
            items={[
              {
                key: "product-shelf",
                label: "产品货架",
                children: <ProductShelfPage />
              },
              {
                key: "client-management",
                label: "客户管理",
                children: <ClientManagementPage />
              },
              {
                key: "dashboard",
                label: "数据概览",
                children: (
                  <Suspense fallback={<DashboardLoadingFallback />}>
                    <DashboardPage />
                  </Suspense>
                )
              }
            ]}
          />
        </Card>
      </main>
      <AgentQueryLauncher />
    </>
  );
}
