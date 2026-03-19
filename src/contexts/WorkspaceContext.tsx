import { createContext, useContext, useState, ReactNode, useCallback } from "react";

interface Workspace {
  id: string;
  name: string;
  description: string;
  memberCount: number;
}

interface WorkspaceContextType {
  currentWorkspace: Workspace;
  workspaces: Workspace[];
  switchWorkspace: (ws: Workspace) => void;
  addWorkspace: (ws: Workspace) => void;
  updateWorkspace: (ws: Workspace) => void;
}

const defaultWorkspaces: Workspace[] = [
  { id: "ws1", name: "物流销售", description: "物流销售团队培训空间", memberCount: 25 },
  { id: "ws2", name: "健康即时零售", description: "健康即时零售业务线", memberCount: 18 },
  { id: "ws3", name: "CCO-政企", description: "CCO政企业务培训", memberCount: 12 },
  { id: "ws4", name: "HRBP-ER", description: "HRBP人力资源培训", memberCount: 8 },
  { id: "ws5", name: "科技保险", description: "科技保险业务培训", memberCount: 15 },
];

const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used within WorkspaceProvider");
  return ctx;
}

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>(defaultWorkspaces);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace>(defaultWorkspaces[0]);

  const switchWorkspace = useCallback((ws: Workspace) => {
    setCurrentWorkspace(ws);
  }, []);

  const addWorkspace = useCallback((ws: Workspace) => {
    setWorkspaces(prev => [...prev, ws]);
    setCurrentWorkspace(ws);
  }, []);

  const updateWorkspace = useCallback((ws: Workspace) => {
    setWorkspaces(prev => prev.map(w => w.id === ws.id ? ws : w));
    setCurrentWorkspace(prev => prev.id === ws.id ? ws : prev);
  }, []);

  return (
    <WorkspaceContext.Provider value={{ currentWorkspace, workspaces, switchWorkspace, addWorkspace, updateWorkspace }}>
      {children}
    </WorkspaceContext.Provider>
  );
}
