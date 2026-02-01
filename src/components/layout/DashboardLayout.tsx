import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Layout, Menu, Avatar, Dropdown, Typography } from "antd";
import type { MenuProps } from "antd";
import {
  HomeOutlined,
  BookOutlined,
  MessageOutlined,
  RobotOutlined,
  NodeIndexOutlined,
  AreaChartOutlined,
  BarChartOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { useAuth } from "@/contexts/AuthContext";
import logoImage from "@/assets/logo.png";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

const menuItems: MenuProps["items"] = [
  {
    key: "/",
    icon: <HomeOutlined />,
    label: "首页",
  },
  {
    key: "/training/plans",
    icon: <BookOutlined />,
    label: "培训计划",
  },
  {
    key: "/practices",
    icon: <MessageOutlined />,
    label: "练习计划",
  },
  {
    key: "/characters",
    icon: <RobotOutlined />,
    label: "角色配置",
  },
  {
    key: "/learning-map",
    icon: <NodeIndexOutlined />,
    label: "学习地图",
  },
  {
    key: "/growth-map",
    icon: <AreaChartOutlined />,
    label: "成长地图",
  },
  {
    key: "/analytics",
    icon: <BarChartOutlined />,
    label: "数据看板",
  },
];

export function DashboardLayout({ children, title, description }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "用户";
  const initials = displayName.slice(0, 2).toUpperCase();

  const handleMenuClick: MenuProps["onClick"] = (e) => {
    navigate(e.key);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const userMenuItems: MenuProps["items"] = [
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "退出登录",
      danger: true,
      onClick: handleSignOut,
    },
  ];

  const getSelectedKey = () => {
    if (location.pathname === "/" || location.pathname === "/dashboard") {
      return "/";
    }
    return location.pathname;
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        trigger={null}
        theme="light"
        style={{ 
          borderRight: "1px solid #f0f0f0",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
          overflow: "auto",
        }}
      >
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            padding: collapsed ? 0 : "0 16px",
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          <img
            src={logoImage}
            alt="JoyLearning Logo"
            style={{
              width: 32,
              height: 32,
            }}
          />
          {!collapsed && (
            <div style={{ marginLeft: 12 }}>
              <Text strong style={{ fontSize: 14 }}>
                JoyLearning
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                AI培训平台
              </Text>
            </div>
          )}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ borderRight: 0 }}
        />
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: "margin-left 0.2s" }}>
        <Header
          style={{
            padding: "0 24px",
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #f0f0f0",
            position: "sticky",
            top: 0,
            zIndex: 99,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {collapsed ? (
              <MenuUnfoldOutlined
                style={{ fontSize: 18, cursor: "pointer" }}
                onClick={() => setCollapsed(false)}
              />
            ) : (
              <MenuFoldOutlined
                style={{ fontSize: 18, cursor: "pointer" }}
                onClick={() => setCollapsed(true)}
              />
            )}
            {title && (
              <div>
                <Text strong style={{ fontSize: 18 }}>
                  {title}
                </Text>
                {description && (
                  <Text type="secondary" style={{ marginLeft: 12, fontSize: 14 }}>
                    {description}
                  </Text>
                )}
              </div>
            )}
          </div>
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
              <Avatar style={{ backgroundColor: "#1677ff" }}>{initials}</Avatar>
              <Text>{displayName}</Text>
            </div>
          </Dropdown>
        </Header>
        <Content style={{ margin: 24, background: "#fff", borderRadius: 8, padding: 24, minHeight: "calc(100vh - 64px - 48px)" }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
