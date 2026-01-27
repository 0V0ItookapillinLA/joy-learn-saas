import { useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  BookOpen,
  MessageSquare,
  Bot,
  Map,
  BarChart3,
  Settings,
  GraduationCap,
  LogOut,
  User,
  Shield,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const menuItems = [
  {
    title: "首页",
    icon: Home,
    url: "/",
  },
  {
    title: "培训计划",
    icon: BookOpen,
    url: "/training/plans",
  },
  {
    title: "练习计划",
    icon: MessageSquare,
    url: "/practices",
  },
  {
    title: "角色配置",
    icon: Bot,
    url: "/characters",
  },
  {
    title: "成长地图",
    icon: Map,
    url: "/growth-map",
  },
  {
    title: "数据看板",
    icon: BarChart3,
    url: "/analytics",
  },
  {
    title: "系统设置",
    icon: Settings,
    url: "/settings",
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isAdmin, isSuperAdmin, role } = useUserRole();

  const isActive = (url: string) => {
    if (url === "/") {
      return location.pathname === "/" || location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(url);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  // Get user display name and initials
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || '用户';
  const initials = displayName.slice(0, 2).toUpperCase();

  // Role display
  const getRoleLabel = () => {
    if (isSuperAdmin) return '超级管理员';
    if (role === 'org_admin') return '组织管理员';
    if (role === 'manager') return '管理员';
    return '学员';
  };

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-sidebar-foreground">
                JoyLearning
              </span>
              <span className="text-xs text-sidebar-foreground/60">
                AI培训平台
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild tooltip={item.title} isActive={isActive(item.url)}>
                    <NavLink
                      to={item.url}
                      className="flex items-center gap-2"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        {/* User info section */}
        <div className="px-2 py-3">
          {!collapsed ? (
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {displayName}
                </p>
                <div className="flex items-center gap-1">
                  {isAdmin && <Shield className="h-3 w-3 text-primary" />}
                  <span className="text-xs text-sidebar-foreground/60">
                    {getRoleLabel()}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center mb-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>
          )}
        </div>

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleSignOut}
              tooltip="退出登录"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              {!collapsed && <span>退出登录</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
