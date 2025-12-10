import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Users, TrendingUp, CreditCard, AlertCircle } from "lucide-react";

interface MembershipData {
  date: string;
  activeMembers: number;
  newMembers: number;
  churnRate: number;
  revenue: number;
}

interface MembershipMetricsProps {
  data: MembershipData[];
  totalMembers: number;
  activeMembers: number;
  monthlyRecurringRevenue: number;
  churnRate: number;
}

export default function MembershipMetrics({
  data,
  totalMembers,
  activeMembers,
  monthlyRecurringRevenue,
  churnRate,
}: MembershipMetricsProps) {
  const retentionRate = 100 - churnRate;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
      {/* Stats Cards */}
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">Active Members</p>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {activeMembers.toLocaleString()}
            </h3>
            <p className="text-xs font-semibold text-green-600">↑ 8.5% this month</p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <Users className="w-6 h-6 text-green-500" />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">MRR</p>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              ${monthlyRecurringRevenue.toFixed(2)}
            </h3>
            <p className="text-xs font-semibold text-blue-600">↑ 12.3% this month</p>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg">
            <CreditCard className="w-6 h-6 text-blue-500" />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">Retention Rate</p>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {retentionRate.toFixed(1)}%
            </h3>
            <p className="text-xs font-semibold text-purple-600">↑ 2.1% this month</p>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg">
            <TrendingUp className="w-6 h-6 text-purple-500" />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">Churn Rate</p>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {churnRate.toFixed(2)}%
            </h3>
            {churnRate > 5 ? (
              <Badge className="bg-red-100 text-red-800 mt-2">
                <AlertCircle className="w-3 h-3 mr-1" />
                High
              </Badge>
            ) : (
              <Badge className="bg-green-100 text-green-800 mt-2">
                <TrendingUp className="w-3 h-3 mr-1" />
                Healthy
              </Badge>
            )}
          </div>
          <div className="bg-orange-50 p-3 rounded-lg">
            <AlertCircle className="w-6 h-6 text-orange-500" />
          </div>
        </div>
      </Card>

      {/* Charts */}
      <Card className="lg:col-span-2 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Members Growth
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorMembers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "1px solid #374151",
                borderRadius: "8px",
                color: "#f3f4f6",
              }}
            />
            <Area
              type="monotone"
              dataKey="activeMembers"
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#colorMembers)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <Card className="lg:col-span-2 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          New Members & Revenue
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "1px solid #374151",
                borderRadius: "8px",
                color: "#f3f4f6",
              }}
            />
            <Legend />
            <Bar
              yAxisId="left"
              dataKey="newMembers"
              fill="#10b981"
              radius={[8, 8, 0, 0]}
            />
            <Bar
              yAxisId="right"
              dataKey="revenue"
              fill="#f59e0b"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
