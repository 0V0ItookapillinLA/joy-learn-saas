import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Map } from "lucide-react";
import type { LearningMap } from "@/pages/learning-map/LearningMapLibrary";

interface LearningMapTableProps {
  maps: LearningMap[];
  onView: (map: LearningMap) => void;
  onEdit: (map: LearningMap) => void;
  onPublish: (map: LearningMap) => void;
  onDisable: (map: LearningMap) => void;
  onCreateVersion: (map: LearningMap) => void;
}

export function LearningMapTable({
  maps,
  onView,
  onEdit,
  onPublish,
  onDisable,
  onCreateVersion,
}: LearningMapTableProps) {
  const getStatusBadge = (status: LearningMap["status"]) => {
    switch (status) {
      case "published":
        return (
          <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/10 border-0">
            已发布
          </Badge>
        );
      case "draft":
        return <Badge variant="secondary">草稿</Badge>;
      case "disabled":
        return (
          <Badge variant="outline" className="text-muted-foreground">
            已停用
          </Badge>
        );
    }
  };

  const getAudienceBadges = (audience: string[]) => {
    return audience.map((a) => (
      <Badge key={a} variant="outline" className="text-xs mr-1">
        {a}
      </Badge>
    ));
  };

  if (maps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Map className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">
          暂无学习地图
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          点击右上角"新建学习地图"按钮，为岗位创建系统化的学习路径
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[200px]">地图名称</TableHead>
          <TableHead className="w-[100px]">岗位</TableHead>
          <TableHead className="w-[100px]">覆盖能力</TableHead>
          <TableHead className="w-[100px]">覆盖任务</TableHead>
          <TableHead className="w-[80px]">学习阶段</TableHead>
          <TableHead className="w-[140px]">适用人群</TableHead>
          <TableHead className="w-[80px]">状态</TableHead>
          <TableHead className="w-[60px]">版本</TableHead>
          <TableHead className="w-[140px]">最近更新</TableHead>
          <TableHead className="w-[180px]">操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {maps.map((map) => (
          <TableRow key={map.id}>
            <TableCell className="font-medium">
              <div className="flex items-center gap-2">
                <Map className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="truncate">{map.name}</span>
              </div>
            </TableCell>
            <TableCell>{map.position}</TableCell>
            <TableCell>
              <span className="text-primary font-medium">
                {map.behaviorTagCount}
              </span>
              <span className="text-muted-foreground text-xs ml-1">个标签</span>
            </TableCell>
            <TableCell>
              <span className="text-primary font-medium">
                {map.taskTagCount}
              </span>
              <span className="text-muted-foreground text-xs ml-1">个任务</span>
            </TableCell>
            <TableCell>
              <span className="text-primary font-medium">{map.stageCount}</span>
              <span className="text-muted-foreground text-xs ml-1">个阶段</span>
            </TableCell>
            <TableCell>{getAudienceBadges(map.targetAudience)}</TableCell>
            <TableCell>{getStatusBadge(map.status)}</TableCell>
            <TableCell>
              <span className="text-muted-foreground">{map.version}</span>
            </TableCell>
            <TableCell>
              <div className="text-sm">
                <span className="text-foreground">{map.updatedBy}</span>
                <span className="text-muted-foreground text-xs block">
                  {map.updatedAt}
                </span>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <button
                  className="text-sm text-primary hover:underline"
                  onClick={() => onView(map)}
                >
                  查看
                </button>
                {map.status === "draft" && (
                  <>
                    <button
                      className="text-sm text-primary hover:underline"
                      onClick={() => onEdit(map)}
                    >
                      编辑
                    </button>
                    <button
                      className="text-sm text-primary hover:underline"
                      onClick={() => onPublish(map)}
                    >
                      发布
                    </button>
                  </>
                )}
                {map.status === "published" && (
                  <>
                    <button
                      className="text-sm text-primary hover:underline"
                      onClick={() => onCreateVersion(map)}
                    >
                      新版本
                    </button>
                    <button
                      className="text-sm text-destructive hover:underline"
                      onClick={() => onDisable(map)}
                    >
                      停用
                    </button>
                  </>
                )}
                {map.status === "disabled" && (
                  <button
                    className="text-sm text-muted-foreground hover:underline"
                    onClick={() => onView(map)}
                  >
                    查看记录
                  </button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
