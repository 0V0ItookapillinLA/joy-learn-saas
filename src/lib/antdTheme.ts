import type { ThemeConfig } from "antd";

// 将 HSL 转换为 RGB 十六进制颜色
// 基于 index.css 中的设计系统颜色
export const antdTheme: ThemeConfig = {
  token: {
    // Primary: Professional Blue (217 91% 60%)
    colorPrimary: "#3b82f6",
    colorPrimaryHover: "#2563eb",
    colorPrimaryActive: "#1d4ed8",
    colorPrimaryBg: "#eff6ff",
    colorPrimaryBgHover: "#dbeafe",
    colorPrimaryBorder: "#93c5fd",
    colorPrimaryText: "#3b82f6",
    colorPrimaryTextHover: "#2563eb",
    colorPrimaryTextActive: "#1d4ed8",

    // Success: Green (142 71% 45%)
    colorSuccess: "#22c55e",
    colorSuccessBg: "#f0fdf4",
    colorSuccessBorder: "#86efac",
    colorSuccessText: "#22c55e",

    // Warning: Amber (38 92% 50%)
    colorWarning: "#f59e0b",
    colorWarningBg: "#fffbeb",
    colorWarningBorder: "#fcd34d",
    colorWarningText: "#f59e0b",

    // Error/Destructive: Red (0 84% 60%)
    colorError: "#ef4444",
    colorErrorBg: "#fef2f2",
    colorErrorBorder: "#fca5a5",
    colorErrorText: "#ef4444",

    // Info: Cyan (199 89% 48%)
    colorInfo: "#06b6d4",
    colorInfoBg: "#ecfeff",
    colorInfoBorder: "#67e8f9",
    colorInfoText: "#06b6d4",

    // Text colors
    colorText: "#1e293b", // foreground (222 47% 11%)
    colorTextSecondary: "#64748b", // muted-foreground (220 9% 46%)
    colorTextTertiary: "#94a3b8",
    colorTextQuaternary: "#cbd5e1",

    // Background
    colorBgContainer: "#ffffff",
    colorBgElevated: "#ffffff",
    colorBgLayout: "#f8fafc",
    colorBgSpotlight: "#ffffff",
    colorBgMask: "rgba(0, 0, 0, 0.45)",

    // Border
    colorBorder: "#e2e8f0", // border (220 13% 91%)
    colorBorderSecondary: "#f1f5f9",
    
    // Fill
    colorFill: "#f1f5f9",
    colorFillSecondary: "#f8fafc",
    colorFillTertiary: "#fafafa",
    colorFillQuaternary: "#ffffff",

    // Border radius
    borderRadius: 8,
    borderRadiusSM: 6,
    borderRadiusLG: 10,
    borderRadiusXS: 4,

    // Font
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'",
    fontSize: 14,
    fontSizeSM: 12,
    fontSizeLG: 16,
    fontSizeXL: 20,
    fontSizeHeading1: 38,
    fontSizeHeading2: 30,
    fontSizeHeading3: 24,
    fontSizeHeading4: 20,
    fontSizeHeading5: 16,

    // Control height
    controlHeight: 36,
    controlHeightSM: 28,
    controlHeightLG: 44,

    // Line height
    lineHeight: 1.5714,
    lineHeightSM: 1.6667,
    lineHeightLG: 1.5,

    // Motion
    motionDurationFast: "0.1s",
    motionDurationMid: "0.2s",
    motionDurationSlow: "0.3s",

    // Box shadow
    boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)",
    boxShadowSecondary: "0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)",
  },
  components: {
    Button: {
      primaryShadow: "0 2px 0 rgba(59, 130, 246, 0.1)",
      defaultBorderColor: "#e2e8f0",
      defaultColor: "#1e293b",
      defaultBg: "#ffffff",
      fontWeight: 500,
    },
    Input: {
      activeBorderColor: "#3b82f6",
      hoverBorderColor: "#93c5fd",
      activeShadow: "0 0 0 2px rgba(59, 130, 246, 0.1)",
    },
    Select: {
      optionSelectedBg: "#eff6ff",
      optionActiveBg: "#f1f5f9",
    },
    Table: {
      headerBg: "#f8fafc",
      headerColor: "#64748b",
      headerSortActiveBg: "#f1f5f9",
      headerSortHoverBg: "#f1f5f9",
      rowHoverBg: "#f8fafc",
      borderColor: "#e2e8f0",
    },
    Card: {
      headerBg: "transparent",
      colorBorderSecondary: "#e2e8f0",
    },
    Menu: {
      itemSelectedBg: "#eff6ff",
      itemSelectedColor: "#3b82f6",
      itemHoverBg: "#f8fafc",
      subMenuItemBg: "#ffffff",
    },
    Modal: {
      headerBg: "#ffffff",
      contentBg: "#ffffff",
    },
    Drawer: {
      colorBgElevated: "#ffffff",
    },
    Tag: {
      defaultBg: "#f1f5f9",
      defaultColor: "#64748b",
    },
    Badge: {
      colorBgContainer: "#ffffff",
    },
    Tree: {
      nodeSelectedBg: "#eff6ff",
      nodeHoverBg: "#f8fafc",
    },
    Tabs: {
      itemSelectedColor: "#3b82f6",
      itemHoverColor: "#2563eb",
      inkBarColor: "#3b82f6",
    },
    Collapse: {
      headerBg: "#f8fafc",
      contentBg: "#ffffff",
    },
  },
};

// 暗色主题配置
export const antdDarkTheme: ThemeConfig = {
  token: {
    ...antdTheme.token,
    
    // 暗色背景
    colorBgContainer: "#1e293b",
    colorBgElevated: "#1e293b",
    colorBgLayout: "#0f172a",
    colorBgSpotlight: "#334155",
    
    // 暗色文字
    colorText: "#f1f5f9",
    colorTextSecondary: "#94a3b8",
    colorTextTertiary: "#64748b",
    colorTextQuaternary: "#475569",
    
    // 暗色边框
    colorBorder: "#334155",
    colorBorderSecondary: "#1e293b",
    
    // 暗色填充
    colorFill: "#334155",
    colorFillSecondary: "#1e293b",
    colorFillTertiary: "#0f172a",
    colorFillQuaternary: "#0f172a",
  },
};
