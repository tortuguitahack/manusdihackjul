import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Code2, Zap, TrendingUp, AlertTriangle } from "lucide-react";

interface APIUsageData {
  date: string;
  requests: number;
  revenue: number;
}

interface EndpointUsage {
  name: string;
  calls: number;
  revenue: number;
}

interface APIUsageMetricsProps {
  data: APIUsageData[];
  endpointUsage: EndpointUsage[];
  totalRequests: number;
  totalRevenue: number;
  avgResponseTime: number;
  errorRate: number;
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function APIUsageMetrics({
  data,
  endpointUsage,
  totalRequests,
  totalRevenue,
  avgResponseTime,
  errorRate,
}: APIUsageMetricsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
      {/* Stats Cards */}
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">API Revenue</p>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              ${totalRevenue.toFixed(2)}
            </h3>
            <p className="text-xs font-semibold text-green-600">↑ 15.2% this month</p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <TrendingUp className="w-6 h-6 text-green-500" />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">Total Requests</p>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {totalRequests.toLocaleString()}
            </h3>
            <p className="text-xs font-semibold text-blue-600">↑ 23.1% this month</p>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg">
            <Code2 className="w-6 h-6 text-blue-500" />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">
              Avg Response Time
            </p>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {avgResponseTime.toFixed(0)}ms
            </h3>
            <p className="text-xs font-semibold text-purple-600">↓ 5.2% improvement</p>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg">
            <Zap className="w-6 h-6 text-purple-500" />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">Error Rate</p>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {errorRate.toFixed(2)}%
            </h3>
            <Badge className="bg-red-100 text-red-800 mt-2">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Monitor
            </Badge>
          </div>
          <div className="bg-red-50 p-3 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
        </div>
      </Card>

      {/* Charts */}
      <Card className="lg:col-span-2 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Requests & Revenue Trend
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
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
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="requests"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: "#3b82f6", r: 4 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="revenue"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: "#10b981", r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card className="lg:col-span-2 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Top Endpoints by Revenue
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={endpointUsage}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, revenue }) => `${name}: $${revenue.toFixed(2)}`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="revenue"
            >
              {endpointUsage.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "1px solid #374151",
                borderRadius: "8px",
                color: "#f3f4f6",
              }}
              formatter={(value) =>
                typeof value === "number" ? `$${value.toFixed(2)}` : value
              }
            />
          </PieChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
