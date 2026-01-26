import { useState } from "react";
import { useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  MessageSquare,
  ClipboardCheck,
  Users,
  UserPlus,
  Map,
  Bot,
  FolderOpen,
  FileQuestion,
  BarChart3,
  Activity,
  Building2,
  Shield,
  Package,
  ChevronDown,
  GraduationCap,
  LogOut,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const menuItems = [
  {
    title: "工作台",
    icon: LayoutDashboard,
    url: "/dashboard",
  },
  {
    title: "培训管理",
    icon: BookOpen,
    children: [
      { title: "培训计划", url: "/training/plans", icon: BookOpen },
      { title: "练习管理", url: "/training/practices", icon: MessageSquare },
      { title: "考评管理", url: "/training/assessments", icon: ClipboardCheck },
    ],
  },
  {
    title: "学员中心",
    icon: Users,
    children: [
      { title: "学员列表", url: "/trainees/list", icon: Users },
      { title: "邀请管理", url: "/trainees/invitations", icon: UserPlus },
      { title: "成长地图", url: "/trainees/growth-map", icon: Map },
    ],
  },
  {
    title: "角色配置",
    icon: Bot,
    children: [
      { title: "AI角色管理", url: "/characters", icon: Bot },
    ],
  },
  {
    title: "内容管理",
    icon: FolderOpen,
    children: [
      { title: "知识库", url: "/content/knowledge", icon: FolderOpen },
      { title: "题库", url: "/content/questions", icon: FileQuestion },
    ],
  },
  {
    title: "数据看板",
    icon: BarChart3,
    children: [
      { title: "培训看板", url: "/analytics/training", icon: BarChart3 },
      { title: "练习看板", url: "/analytics/practice", icon: Activity },
    ],
  },
  {
    title: "系统设置",
    icon: Building2,
    children: [
      { title: "组织架构", url: "/settings/organization", icon: Building2 },
      { title: "权限管理", url: "/settings/permissions", icon: Shield },
      { title: "套餐配置", url: "/settings/plans", icon: Package },
    ],
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { signOut, user } = useAuth();
  const [openGroups, setOpenGroups] = useState<string[]>(["培训管理", "学员中心"]);

  const isActive = (url: string) => location.pathname === url;
  const isGroupActive = (children?: { url: string }[]) =>
    children?.some((child) => location.pathname.startsWith(child.url));

  const toggleGroup = (title: string) => {
    setOpenGroups((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
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
              {menuItems.map((item) =>
                item.children ? (
                  <Collapsible
                    key={item.title}
                    open={openGroups.includes(item.title)}
                    onOpenChange={() => toggleGroup(item.title)}
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          tooltip={item.title}
                          isActive={isGroupActive(item.children)}
                        >
                          <item.icon className="h-4 w-4" />
                          {!collapsed && <span>{item.title}</span>}
                          {!collapsed && (
                            <ChevronDown
                              className={`ml-auto h-4 w-4 transition-transform ${
                                openGroups.includes(item.title) ? "rotate-180" : ""
                              }`}
                            />
                          )}
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.children.map((child) => (
                            <SidebarMenuSubItem key={child.url}>
                              <NavLink
                                to={child.url}
                                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                              >
                                <child.icon className="h-3.5 w-3.5" />
                                <span>{child.title}</span>
                              </NavLink>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                ) : (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild tooltip={item.title} isActive={isActive(item.url!)}>
                      <NavLink
                        to={item.url!}
                        className="flex items-center gap-2"
                        activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      >
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => signOut()}
              tooltip="退出登录"
              className="text-sidebar-foreground/70 hover:text-sidebar-foreground"
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
