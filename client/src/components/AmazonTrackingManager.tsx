import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
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
import { Plus, TrendingUp, DollarSign, Target } from "lucide-react";

const REGIONS = [
  "US",
  "UK",
  "DE",
  "FR",
  "ES",
  "IT",
  "CA",
  "AU",
  "NL",
  "PL",
  "SE",
];
const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function AmazonTrackingManager() {
  const [selectedRegion, setSelectedRegion] = useState("US");
  const [newTrackingId, setNewTrackingId] = useState("");

  // Queries
  const metricsQuery = trpc.amazonTracking.getMetrics.useQuery();
  const allTrackingIdsQuery = trpc.amazonTracking.getAll.useQuery();
  const regionTrackingIdsQuery = trpc.amazonTracking.getByRegion.useQuery(
    { region: selectedRegion },
    { enabled: !!selectedRegion }
  );

  // Mutations
  const createTrackingIdMutation = trpc.amazonTracking.create.useMutation({
    onSuccess: () => {
      setNewTrackingId("");
      metricsQuery.refetch();
      allTrackingIdsQuery.refetch();
      regionTrackingIdsQuery.refetch();
    },
  });

  const handleAddTrackingId = () => {
    if (!newTrackingId.trim()) return;
    createTrackingIdMutation.mutate({
      region: selectedRegion,
      trackingId: newTrackingId,
    });
  };

  const metrics = metricsQuery.data || {
    totalEarnings: 0,
    totalClicks: 0,
    totalConversions: 0,
    conversionRate: 0,
    byRegion: {},
    totalTrackingIds: 0,
  };

  const regionTrackingIds = regionTrackingIdsQuery.data || [];

  // Preparar datos para gráficos
  const regionData = Object.entries(metrics.byRegion || {}).map(([region, data]) => ({
    region,
    earnings: (data as any).earnings || 0,
    conversions: (data as any).conversions || 0,
    clicks: (data as any).clicks || 0,
  }));

  const conversionRateByRegion = Object.entries(metrics.byRegion || {}).map(
    ([region, data]) => {
      const d = data as any;
      const rate = d.clicks > 0 ? (d.conversions / d.clicks) * 100 : 0;
      return {
        region,
        rate: parseFloat(rate.toFixed(2)),
      };
    }
  );

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">
                Total Earnings
              </p>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                ${metrics.totalEarnings.toFixed(2)}
              </h3>
              <p className="text-xs font-semibold text-green-600">
                From {metrics.totalTrackingIds} Tracking IDs
              </p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">
                Total Clicks
              </p>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {metrics.totalClicks.toLocaleString()}
              </h3>
              <p className="text-xs font-semibold text-blue-600">
                ↑ 12.5% this month
              </p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <Target className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">
                Conversions
              </p>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {metrics.totalConversions.toLocaleString()}
              </h3>
              <p className="text-xs font-semibold text-purple-600">
                {metrics.conversionRate.toFixed(2)}% conversion rate
              </p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-500" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">
                Avg Earnings per Click
              </p>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                ${
                  metrics.totalClicks > 0
                    ? (metrics.totalEarnings / metrics.totalClicks).toFixed(2)
                    : "0.00"
                }
              </h3>
              <p className="text-xs font-semibold text-orange-600">
                Performance metric
              </p>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-orange-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Earnings by Region
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={regionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="region" />
              <YAxis />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#f3f4f6",
                }}
              />
              <Bar dataKey="earnings" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Conversion Rate by Region
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={conversionRateByRegion}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="region" />
              <YAxis />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#f3f4f6",
                }}
                formatter={(value) => `${value}%`}
              />
              <Bar dataKey="rate" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Tracking IDs Management */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Tracking IDs by Region
          </h3>
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            {REGIONS.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </div>

        {/* Add New Tracking ID */}
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            placeholder="Enter new Tracking ID..."
            value={newTrackingId}
            onChange={(e) => setNewTrackingId(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <Button
            onClick={handleAddTrackingId}
            disabled={createTrackingIdMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add
          </Button>
        </div>

        {/* Tracking IDs Table */}
        {regionTrackingIds.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tracking ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Clicks</TableHead>
                  <TableHead>Conversions</TableHead>
                  <TableHead>Earnings</TableHead>
                  <TableHead>Performance Score</TableHead>
                  <TableHead>Last Used</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {regionTrackingIds.map((tid) => (
                  <TableRow key={tid.id}>
                    <TableCell className="font-mono text-sm">
                      {tid.trackingId}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          tid.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }
                      >
                        {tid.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>{tid.totalClicks || 0}</TableCell>
                    <TableCell>{tid.totalConversions || 0}</TableCell>
                    <TableCell>${parseFloat((tid.totalEarnings || "0").toString()).toFixed(2)}</TableCell>
                    <TableCell>
                      {parseFloat((tid.performanceScore || "0").toString()).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {tid.lastUsed
                        ? new Date(tid.lastUsed).toLocaleDateString()
                        : "Never"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">
              No Tracking IDs for {selectedRegion}. Add one to get started.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
