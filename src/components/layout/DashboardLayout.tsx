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
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import logoImg from "@/assets/logo.png";

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
  {
    key: "/settings",
    icon: <SettingOutlined />,
    label: "系统设置",
  },
];

export function DashboardLayout({ children, title, description }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const displayName = "管理员";
  const initials = "管理";

  const handleMenuClick: MenuProps["onClick"] = (e) => {
    navigate(e.key);
  };

  const userMenuItems: MenuProps["items"] = [
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "系统设置",
      onClick: () => navigate("/settings"),
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
        style={{ borderRight: "1px solid #f0f0f0" }}
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
            src={logoImg}
            alt="Logo"
            style={{
              width: 32,
              height: 32,
              objectFit: "contain",
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
      <Layout>
        <Header
          style={{
            padding: "0 24px",
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #f0f0f0",
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
        <Content style={{ margin: 24, background: "#fff", borderRadius: 8, padding: 24 }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
