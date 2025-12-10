import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, AlertTriangle, Zap, Trash2 } from "lucide-react";

export function AlertsPanel() {
  const [activeTab, setActiveTab] = useState("unread");

  // Queries
  const unreadQuery = trpc.alerts.getUnread.useQuery(undefined, {
    refetchInterval: 10000, // Refetch cada 10 segundos
  });

  const allQuery = trpc.alerts.getAll.useQuery(
    { limit: 50, offset: 0 },
    { refetchInterval: 30000 }
  );

  const statsQuery = trpc.alerts.getStats.useQuery(undefined, {
    refetchInterval: 30000,
  });

  // Mutations
  const markAsReadMutation = trpc.alerts.markAsRead.useMutation({
    onSuccess: () => {
      unreadQuery.refetch();
      statsQuery.refetch();
    },
  });

  const sendTestAlertMutation = trpc.alerts.sendTestAlert.useMutation({
    onSuccess: () => {
      unreadQuery.refetch();
      statsQuery.refetch();
    },
  });

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <Zap className="w-5 h-5 text-red-600" />;
      case "high":
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case "medium":
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
    }
  };

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const alerts = activeTab === "unread" ? unreadQuery.data || [] : allQuery.data || [];

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total de Alertas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsQuery.data?.total || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              No Leídas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {statsQuery.data?.unread || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Por Tipo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600">
              {Object.keys(statsQuery.data?.byType || {}).length} tipos
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Alertas del Sistema</CardTitle>
          <CardDescription>
            Monitoreo en tiempo real de eventos críticos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="unread" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="unread">
                No Leídas ({unreadQuery.data?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="all">
                Todas ({allQuery.data?.length || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="unread" className="space-y-3 mt-4">
              {unreadQuery.isLoading ? (
                <div className="text-center py-8 text-gray-500">
                  Cargando alertas...
                </div>
              ) : (unreadQuery.data || []).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  ✅ No hay alertas sin leer
                </div>
              ) : (
                (unreadQuery.data || []).map((alert) => (
                  <div
                    key={alert.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {getSeverityIcon(alert.severity)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">
                              {alert.title}
                            </h3>
                            <Badge className={getSeverityBadgeColor(alert.severity)}>
                              {alert.severity.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {alert.message}
                          </p>
                          <div className="text-xs text-gray-500 mt-2">
                            {new Date(alert.createdAt).toLocaleString("es-ES")}
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          markAsReadMutation.mutate({ alertId: alert.id })
                        }
                        disabled={markAsReadMutation.isPending}
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="all" className="space-y-3 mt-4">
              {allQuery.isLoading ? (
                <div className="text-center py-8 text-gray-500">
                  Cargando alertas...
                </div>
              ) : (allQuery.data || []).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No hay alertas
                </div>
              ) : (
                (allQuery.data || []).map((alert) => (
                  <div
                    key={alert.id}
                    className={`border rounded-lg p-4 transition ${
                      alert.read ? "bg-gray-50" : "bg-white hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {getSeverityIcon(alert.severity)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">
                              {alert.title}
                            </h3>
                            <Badge className={getSeverityBadgeColor(alert.severity)}>
                              {alert.severity.toUpperCase()}
                            </Badge>
                            {alert.read && (
                              <Badge variant="outline" className="text-xs">
                                Leída
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {alert.message}
                          </p>
                          <div className="text-xs text-gray-500 mt-2">
                            {new Date(alert.createdAt).toLocaleString("es-ES")}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>

          {/* Test Alert Button */}
          <div className="mt-6 pt-4 border-t">
            <Button
              onClick={() =>
                sendTestAlertMutation.mutate({
                  type: "test_alert",
                  severity: "high",
                  title: "🧪 Alerta de Prueba",
                  message: "Esta es una alerta de prueba del sistema de monitoreo",
                })
              }
              disabled={sendTestAlertMutation.isPending}
              variant="outline"
              className="w-full"
            >
              {sendTestAlertMutation.isPending
                ? "Enviando..."
                : "Enviar Alerta de Prueba"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
