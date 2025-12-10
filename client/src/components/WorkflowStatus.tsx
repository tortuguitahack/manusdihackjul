import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Play,
  Pause,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
} from "lucide-react";

interface Workflow {
  id: number;
  name: string;
  type: string;
  status: "idle" | "running" | "completed" | "failed";
  earnings: number;
  executionCount: number;
  errorCount: number;
  lastRun?: Date;
  nextRun?: Date;
}

interface WorkflowStatusProps {
  workflows: Workflow[];
  onExecute?: (workflowId: number) => void;
  onPause?: (workflowId: number) => void;
}

const statusConfig = {
  idle: {
    color: "bg-gray-100 text-gray-800",
    icon: Pause,
    label: "Idle",
  },
  running: {
    color: "bg-blue-100 text-blue-800",
    icon: Zap,
    label: "Running",
  },
  completed: {
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
    label: "Completed",
  },
  failed: {
    color: "bg-red-100 text-red-800",
    icon: AlertCircle,
    label: "Failed",
  },
};

export default function WorkflowStatus({
  workflows,
  onExecute,
  onPause,
}: WorkflowStatusProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {workflows.map((workflow) => {
        const config = statusConfig[workflow.status];
        const StatusIcon = config.icon;
        const successRate =
          workflow.executionCount > 0
            ? (((workflow.executionCount - workflow.errorCount) /
                workflow.executionCount) *
                100)
            : 0;

        return (
          <Card key={workflow.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {workflow.name}
                  </h3>
                  <Badge className={config.color}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {config.label}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{workflow.type}</p>
              </div>
              <div className="flex gap-2">
                {workflow.status === "idle" && onExecute && (
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => onExecute(workflow.id)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Execute
                  </Button>
                )}
                {workflow.status === "running" && onPause && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onPause(workflow.id)}
                  >
                    <Pause className="w-4 h-4 mr-1" />
                    Pause
                  </Button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-600 mb-1">Earnings</p>
                <p className="text-lg font-bold text-green-600">
                  ${workflow.earnings.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Executions</p>
                <p className="text-lg font-bold text-blue-600">
                  {workflow.executionCount}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Success Rate</p>
                <p className="text-lg font-bold text-orange-600">
                  {successRate.toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <p className="text-xs font-medium text-gray-600">Success Rate</p>
                <p className="text-xs font-semibold text-gray-900">
                  {successRate.toFixed(1)}%
                </p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${successRate}%` }}
                />
              </div>
            </div>

            {/* Last Run Info */}
            <div className="flex items-center justify-between text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {workflow.lastRun ? (
                  <span>
                    Last run:{" "}
                    {new Date(workflow.lastRun).toLocaleTimeString()}
                  </span>
                ) : (
                  <span>Never executed</span>
                )}
              </div>
              {workflow.errorCount > 0 && (
                <div className="flex items-center gap-1 text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span>{workflow.errorCount} errors</span>
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
