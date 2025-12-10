import { Card } from "@/components/ui/card";
import { TrendingUp, Zap, Workflow, DollarSign } from "lucide-react";

interface StatsCardsProps {
  totalEarnings: number;
  totalWorkflows: number;
  activeExecutions: number;
  successRate: number;
}

export default function StatsCards({
  totalEarnings,
  totalWorkflows,
  activeExecutions,
  successRate,
}: StatsCardsProps) {
  const stats = [
    {
      title: "Total Earnings",
      value: `$${totalEarnings.toFixed(2)}`,
      icon: DollarSign,
      color: "text-green-500",
      bgColor: "bg-green-50",
      change: "+12.5%",
      changeColor: "text-green-600",
    },
    {
      title: "Active Workflows",
      value: totalWorkflows.toString(),
      icon: Workflow,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      change: "8 running",
      changeColor: "text-blue-600",
    },
    {
      title: "Executions Today",
      value: activeExecutions.toString(),
      icon: Zap,
      color: "text-purple-500",
      bgColor: "bg-purple-50",
      change: "40/40 limit",
      changeColor: "text-purple-600",
    },
    {
      title: "Success Rate",
      value: `${successRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: "text-orange-500",
      bgColor: "bg-orange-50",
      change: "↑ 2.3%",
      changeColor: "text-orange-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card
            key={index}
            className="p-6 hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {stat.title}
                </p>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </h3>
                <p className={`text-xs font-semibold ${stat.changeColor}`}>
                  {stat.change}
                </p>
              </div>
              <div className={`${stat.bgColor} p-3 rounded-lg`}>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
