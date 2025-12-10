import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, Users, Link2, DollarSign } from "lucide-react";

interface AffiliateData {
  date: string;
  clicks: number;
  conversions: number;
  earnings: number;
}

interface AffiliateMetricsProps {
  data: AffiliateData[];
  totalEarnings: number;
  totalClicks: number;
  totalConversions: number;
  conversionRate: number;
}

export default function AffiliateMetrics({
  data,
  totalEarnings,
  totalClicks,
  totalConversions,
  conversionRate,
}: AffiliateMetricsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
      {/* Stats Cards */}
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">
              Affiliate Earnings
            </p>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              ${totalEarnings.toFixed(2)}
            </h3>
            <p className="text-xs font-semibold text-green-600">↑ 8.2% this week</p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <DollarSign className="w-6 h-6 text-green-500" />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">Total Clicks</p>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {totalClicks.toLocaleString()}
            </h3>
            <p className="text-xs font-semibold text-blue-600">↑ 12.5% this week</p>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg">
            <Link2 className="w-6 h-6 text-blue-500" />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">Conversions</p>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {totalConversions.toLocaleString()}
            </h3>
            <p className="text-xs font-semibold text-purple-600">↑ 5.3% this week</p>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg">
            <Users className="w-6 h-6 text-purple-500" />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">
              Conversion Rate
            </p>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {conversionRate.toFixed(2)}%
            </h3>
            <p className="text-xs font-semibold text-orange-600">↑ 0.8% this week</p>
          </div>
          <div className="bg-orange-50 p-3 rounded-lg">
            <TrendingUp className="w-6 h-6 text-orange-500" />
          </div>
        </div>
      </Card>

      {/* Charts */}
      <Card className="lg:col-span-2 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Clicks & Conversions Trend
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
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
            <Legend />
            <Line
              type="monotone"
              dataKey="clicks"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: "#3b82f6", r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="conversions"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: "#10b981", r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card className="lg:col-span-2 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Earnings Trend
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
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
              formatter={(value) =>
                typeof value === "number" ? `$${value.toFixed(2)}` : value
              }
            />
            <Bar dataKey="earnings" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
