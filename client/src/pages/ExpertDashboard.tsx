import { useState, useEffect } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Clock, DollarSign, Zap, TrendingUp } from 'lucide-react';

interface OrchestrationData {
  agentsActive: number;
  tasksCompleted: number;
  totalEarnings: number;
  lastUpdate: Date;
}

interface PaymentData {
  paymentId: string;
  amount: number;
  status: 'succeeded' | 'failed' | 'pending';
  timestamp: Date;
}

export function ExpertDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [orchestration, setOrchestration] = useState<OrchestrationData | null>(null);
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Queries tRPC
  const orchestrationStatsQuery = trpc.expert.getOrchestrationStats.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchInterval: 30000, // Cada 30 segundos
  });

  const bankAccountQuery = trpc.expert.getBankAccountInfo.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const transactionsQuery = trpc.expert.listTransactions.useQuery(
    { limit: 10 },
    {
      enabled: isAuthenticated,
      refetchInterval: 60000, // Cada minuto
    }
  );

  // Mutations tRPC
  const initializeOrchestrationMutation = trpc.expert.initializeOrchestration.useMutation();
  const startDataCollectionMutation = trpc.expert.startDataCollection.useMutation();
  const executeFullFlowMutation = trpc.expert.executeFullFlow.useMutation();

  const handleInitialize = async () => {
    try {
      setIsExecuting(true);
      await initializeOrchestrationMutation.mutateAsync();
    } finally {
      setIsExecuting(false);
    }
  };

  const handleStartCollection = async () => {
    try {
      setIsExecuting(true);
      await startDataCollectionMutation.mutateAsync();
      orchestrationStatsQuery.refetch();
    } finally {
      setIsExecuting(false);
    }
  };

  const handleExecuteFullFlow = async () => {
    try {
      setIsExecuting(true);
      await executeFullFlowMutation.mutateAsync({
        workflowId: 'main-workflow',
        executionId: `exec-${Date.now()}`,
      });
      orchestrationStatsQuery.refetch();
      transactionsQuery.refetch();
    } finally {
      setIsExecuting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Dashboard Experto
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Por favor, inicia sesión para continuar</p>
        </div>
      </div>
    );
  }

  const stats = orchestrationStatsQuery.data;
  const bankInfo = bankAccountQuery.data;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            🚀 Dashboard Experto
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Control centralizado: Antigravity + n8n + Stripe
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Agentes Activos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats?.activeAgents || 0}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                de {stats?.totalAgents || 0} total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Tareas Completadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {stats?.completedTasks || 0}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Tasa: {Math.round(stats?.successRate || 0)}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Ingresos Totales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                ${orchestrationStatsQuery.data ? '0.00' : '0.00'}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Esta sesión
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Estado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                Operativo
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="orchestration">Orquestación</TabsTrigger>
            <TabsTrigger value="payments">Pagos</TabsTrigger>
            <TabsTrigger value="bank">Banco</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Control Centralizado</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Sistema de automatización integrado con capacidades de:
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <Zap className="w-4 h-4 mr-2 text-yellow-500" />
                      <span>Antigravity: Orquestación de agentes inteligentes</span>
                    </li>
                    <li className="flex items-center">
                      <TrendingUp className="w-4 h-4 mr-2 text-blue-500" />
                      <span>n8n: Workflows automatizados con webhooks</span>
                    </li>
                    <li className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-2 text-green-500" />
                      <span>Stripe: Procesamiento de pagos automático</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-4 border-t space-y-3">
                  <Button
                    onClick={handleInitialize}
                    disabled={isExecuting}
                    className="w-full"
                  >
                    {isExecuting ? 'Inicializando...' : 'Inicializar Orquestación'}
                  </Button>

                  <Button
                    onClick={handleStartCollection}
                    disabled={isExecuting}
                    variant="outline"
                    className="w-full"
                  >
                    {isExecuting ? 'Recopilando...' : 'Recopilar Datos'}
                  </Button>

                  <Button
                    onClick={handleExecuteFullFlow}
                    disabled={isExecuting}
                    variant="secondary"
                    className="w-full"
                  >
                    {isExecuting ? 'Ejecutando...' : '▶️ Ejecutar Flujo Completo'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orchestration Tab */}
          <TabsContent value="orchestration" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Estadísticas de Orquestación</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total de Agentes</p>
                    <p className="text-2xl font-bold">{stats?.totalAgents || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Agentes Activos</p>
                    <p className="text-2xl font-bold text-green-600">{stats?.activeAgents || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total de Tareas</p>
                    <p className="text-2xl font-bold">{stats?.totalTasks || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Tareas Completadas</p>
                    <p className="text-2xl font-bold text-blue-600">{stats?.completedTasks || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Tareas Fallidas</p>
                    <p className="text-2xl font-bold text-red-600">{stats?.failedTasks || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Tasa de Éxito</p>
                    <p className="text-2xl font-bold text-green-600">
                      {Math.round(stats?.successRate || 0)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Plataformas Monitoreadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {['Amazon', 'Gumroad', 'OpenSea', 'Bandcamp', 'Substack'].map((platform) => (
                    <div key={platform} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <span className="text-sm font-medium">{platform}</span>
                      <Badge variant="outline">Activo</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Transacciones Recientes</CardTitle>
              </CardHeader>
              <CardContent>
                {transactionsQuery.data && transactionsQuery.data.length > 0 ? (
                  <div className="space-y-2">
                    {transactionsQuery.data.map((tx: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded"
                      >
                        <div>
                          <p className="text-sm font-medium">{tx.type}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            {new Date(tx.created * 1000).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-green-600">
                            ${(tx.amount / 100).toFixed(2)}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {tx.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      No hay transacciones aún
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bank Tab */}
          <TabsContent value="bank" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Información Bancaria</CardTitle>
              </CardHeader>
              <CardContent>
                {bankInfo ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-500 uppercase">
                        Titular
                      </p>
                      <p className="text-lg font-semibold">{bankInfo.accountHolder}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-500 uppercase">
                          Banco
                        </p>
                        <p className="font-medium">{bankInfo.bankName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-500 uppercase">
                          Tipo
                        </p>
                        <p className="font-medium">Checking</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-500 uppercase">
                        Número de Ruta
                      </p>
                      <p className="font-mono font-medium">{bankInfo.routingNumber}</p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-500 uppercase">
                        Número de Cuenta
                      </p>
                      <p className="font-mono font-medium">
                        ****{bankInfo.lastFourDigits}
                      </p>
                    </div>

                    <div className="pt-4 border-t">
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span>Cuenta verificada y activa</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      No se pudo cargar información bancaria
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
