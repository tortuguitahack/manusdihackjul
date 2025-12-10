import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import StatsCards from "@/components/StatsCards";
import RevenueChart from "@/components/RevenueChart";
import WorkflowStatus from "@/components/WorkflowStatus";
import TransactionsTable from "@/components/TransactionsTable";
import AffiliateMetrics from "@/components/AffiliateMetrics";
import APIUsageMetrics from "@/components/APIUsageMetrics";
import MembershipMetrics from "@/components/MembershipMetrics";
import AmazonTrackingManager from "@/components/AmazonTrackingManager";
import { RealtimeEvents } from "@/components/RealtimeEvents";
import { LiveTransactions } from "@/components/LiveTransactions";
import { AlertsPanel } from "@/components/AlertsPanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { RefreshCw, Download, Loader2 } from "lucide-react";
import { useLocation } from "wouter";

export default function Dashboard() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Queries tRPC para datos reales
  const metricsQuery = trpc.dashboard.metrics.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchInterval: 30000, // Refetch cada 30 segundos
  });

  const chartDataQuery = trpc.dashboard.chartData.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchInterval: 60000,
  });

  const transactionsQuery = trpc.dashboard.transactions.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchInterval: 45000,
  });

  const affiliateQuery = trpc.dashboard.affiliateMetrics.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchInterval: 60000,
  });

  const transactionMetricsQuery = trpc.dashboard.transactionMetrics.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchInterval: 45000,
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      metricsQuery.refetch(),
      chartDataQuery.refetch(),
      transactionsQuery.refetch(),
      affiliateQuery.refetch(),
      transactionMetricsQuery.refetch(),
    ]);
    setRefreshing(false);
  };

  const handleExport = () => {
    console.log("Exporting data...");
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Dashboard de Monitoreo
          </h1>
          <p className="text-gray-600 mb-6">Por favor, inicia sesión para continuar</p>
        </div>
      </div>
    );
  }

  // Datos con fallback a valores por defecto
  const metrics = metricsQuery.data || {
    totalEarnings: 0,
    totalWorkflows: 0,
    activeExecutions: 0,
    successRate: 0,
    recentTransactions: [],
  };

  const chartData = chartDataQuery.data || [];
  const transactions = transactionsQuery.data || [];
  const affiliateMetrics = affiliateQuery.data || {
    totalEarnings: 0,
    totalClicks: 0,
    totalConversions: 0,
    conversionRate: 0,
  };

  const transactionMetrics = transactionMetricsQuery.data || {
    totalRevenue: 0,
    totalTransactions: 0,
    completedTransactions: 0,
    failedTransactions: 0,
  };

  // Datos de workflows mock (en producción, vendría de BD)
  const workflows = [
    {
      id: 1,
      name: "Amazon Influencer Shorts",
      type: "Video Content",
      status: "running" as const,
      earnings: 125.5,
      executionCount: 28,
      errorCount: 1,
      lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000),
      nextRun: new Date(Date.now() + 2 * 60 * 60 * 1000),
    },
    {
      id: 2,
      name: "Stock AI Photos",
      type: "Image Generation",
      status: "completed" as const,
      earnings: 89.3,
      executionCount: 24,
      errorCount: 0,
      lastRun: new Date(Date.now() - 6 * 60 * 60 * 1000),
      nextRun: new Date(Date.now() + 6 * 60 * 60 * 1000),
    },
    {
      id: 3,
      name: "Notion Templates",
      type: "Product Creation",
      status: "idle" as const,
      earnings: 210.5,
      executionCount: 15,
      errorCount: 0,
      lastRun: new Date(Date.now() - 12 * 60 * 60 * 1000),
      nextRun: new Date(Date.now() + 12 * 60 * 60 * 1000),
    },
  ];

  // Datos mock para gráficos adicionales
  const affiliateChartData = [
    { date: "Mon", clicks: 245, conversions: 12, earnings: 185.5 },
    { date: "Tue", clicks: 312, conversions: 18, earnings: 245.3 },
    { date: "Wed", clicks: 289, conversions: 15, earnings: 210.8 },
    { date: "Thu", clicks: 401, conversions: 22, earnings: 325.2 },
    { date: "Fri", clicks: 378, conversions: 20, earnings: 298.5 },
    { date: "Sat", clicks: 456, conversions: 28, earnings: 412.3 },
    { date: "Sun", clicks: 389, conversions: 24, earnings: 356.8 },
  ];

  const apiChartData = [
    { date: "Mon", requests: 1245, revenue: 185.5 },
    { date: "Tue", requests: 1512, revenue: 245.3 },
    { date: "Wed", requests: 1389, revenue: 210.8 },
    { date: "Thu", requests: 1601, revenue: 325.2 },
    { date: "Fri", requests: 1778, revenue: 298.5 },
    { date: "Sat", requests: 1956, revenue: 412.3 },
    { date: "Sun", requests: 1889, revenue: 356.8 },
  ];

  const endpointUsage = [
    { name: "Image Generation", calls: 1245, revenue: 325.5 },
    { name: "Video Processing", calls: 856, revenue: 285.3 },
    { name: "Text Analysis", calls: 2145, revenue: 215.8 },
    { name: "Data Export", calls: 634, revenue: 125.2 },
  ];

  const membershipChartData = [
    { date: "Week 1", activeMembers: 145, newMembers: 12, churnRate: 2.1, revenue: 1450 },
    { date: "Week 2", activeMembers: 158, newMembers: 15, churnRate: 1.9, revenue: 1580 },
    { date: "Week 3", activeMembers: 172, newMembers: 18, churnRate: 1.7, revenue: 1720 },
    { date: "Week 4", activeMembers: 189, newMembers: 22, churnRate: 1.5, revenue: 1890 },
  ];

  const isLoading =
    metricsQuery.isLoading ||
    chartDataQuery.isLoading ||
    transactionsQuery.isLoading;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Ecosistema de Automatización
            </h1>
            <p className="text-gray-600 mt-1">
              Bienvenido, {user?.name || "Usuario"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => navigate('/expert')}
              size="sm"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              🚀 Dashboard Experto
            </Button>
            <Button
              onClick={() => navigate('/workflow-monitor')}
              size="sm"
              variant="outline"
            >
              Monitor de Workflows
            </Button>
            <Button
              onClick={() => navigate('/integrations')}
              size="sm"
              variant="outline"
            >
              Panel de Integraciones
            </Button>
            <Button
              onClick={() => navigate('/n8n-settings')}
              size="sm"
              variant="outline"
            >
              Configuración n8n
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing || isLoading}
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${refreshing || isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        )}

        {!isLoading && (
          <>
            {/* Stats Cards */}
            <StatsCards
              totalEarnings={metrics.totalEarnings || 0}
              totalWorkflows={metrics.totalWorkflows || 0}
              activeExecutions={metrics.activeExecutions || 0}
              successRate={metrics.successRate || 0}
            />

            {/* Tabs */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-6 mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="affiliate">Affiliate</TabsTrigger>
                <TabsTrigger value="api">API</TabsTrigger>
                <TabsTrigger value="membership">Membership</TabsTrigger>
                <TabsTrigger value="amazon">Amazon</TabsTrigger>
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="alerts">Alertas</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <RevenueChart
                  data={chartData.length > 0 ? chartData : []}
                  workflowEarnings={workflows.map((w) => ({
                    name: w.name,
                    value: w.earnings,
                  }))}
                />
                <WorkflowStatus workflows={workflows} />
              </TabsContent>

              {/* Affiliate Tab */}
              <TabsContent value="affiliate">
                <AffiliateMetrics
                  data={affiliateChartData}
                  totalEarnings={affiliateMetrics.totalEarnings || 0}
                  totalClicks={affiliateMetrics.totalClicks || 0}
                  totalConversions={affiliateMetrics.totalConversions || 0}
                  conversionRate={affiliateMetrics.conversionRate || 0}
                />
              </TabsContent>

              {/* API Tab */}
              <TabsContent value="api">
                <APIUsageMetrics
                  data={apiChartData}
                  endpointUsage={endpointUsage}
                  totalRequests={10370}
                  totalRevenue={2034.4}
                  avgResponseTime={245}
                  errorRate={0.8}
                />
              </TabsContent>

              {/* Membership Tab */}
              <TabsContent value="membership">
                <MembershipMetrics
                  data={membershipChartData}
                  totalMembers={189}
                  activeMembers={189}
                  monthlyRecurringRevenue={7640}
                  churnRate={1.5}
                />
              </TabsContent>

              {/* Amazon Tracking Tab */}
              <TabsContent value="amazon">
                <AmazonTrackingManager />
              </TabsContent>

              {/* Alerts Tab */}
              <TabsContent value="alerts">
                <AlertsPanel />
              </TabsContent>

              {/* Transactions Tab */}
              <TabsContent value="transactions">
                <TransactionsTable
                  transactions={transactions.map((t) => ({
                    id: t.id,
                    workflowId: t.workflowId || undefined,
                    amount: parseFloat(t.amount.toString()),
                    currency: t.currency || "USD",
                    status: t.status as "completed" | "pending" | "failed",
                    description: t.description || "Transaction",
                    createdAt: new Date(t.createdAt),
                  }))}
                />
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}
