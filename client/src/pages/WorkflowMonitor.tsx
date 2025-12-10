import { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AlertCircle, CheckCircle, Clock, Play, Pause, RefreshCw, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface Workflow {
  id: string;
  name: string;
  active: boolean;
  nodes: Array<{ name: string; type: string }>;
  createdAt: string;
  updatedAt: string;
}

interface Execution {
  id: string;
  workflowId: string;
  status: 'success' | 'error' | 'waiting';
  startedAt: string;
  stoppedAt: string;
  data?: Record<string, any>;
}

export function WorkflowMonitor() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  const [stats, setStats] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  // Fetch workflows
  useEffect(() => {
    const fetchWorkflows = async () => {
      try {
        setLoading(true);
        // Simular fetch de workflows
        const mockWorkflows: Workflow[] = [
          {
            id: 'wf-1',
            name: 'Amazon Influencer',
            active: true,
            nodes: [{ name: 'Trigger', type: 'webhook' }],
            createdAt: '2024-01-01',
            updatedAt: '2024-11-27',
          },
          {
            id: 'wf-2',
            name: 'Stock AI Analysis',
            active: true,
            nodes: [{ name: 'Trigger', type: 'schedule' }],
            createdAt: '2024-01-02',
            updatedAt: '2024-11-27',
          },
          {
            id: 'wf-3',
            name: 'Notion Sync',
            active: false,
            nodes: [{ name: 'Trigger', type: 'webhook' }],
            createdAt: '2024-01-03',
            updatedAt: '2024-11-26',
          },
        ];
        setWorkflows(mockWorkflows);
        if (mockWorkflows.length > 0) {
          setSelectedWorkflow(mockWorkflows[0].id);
        }
      } catch (error) {
        console.error('Error fetching workflows:', error);
        toast.error('Error al cargar workflows');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkflows();
  }, []);

  // Fetch executions for selected workflow
  useEffect(() => {
    if (!selectedWorkflow) return;

    const fetchExecutions = async () => {
      try {
        // Simular fetch de ejecuciones
        const mockExecutions: Execution[] = [
          {
            id: 'exec-1',
            workflowId: selectedWorkflow,
            status: 'success',
            startedAt: new Date(Date.now() - 3600000).toISOString(),
            stoppedAt: new Date(Date.now() - 3500000).toISOString(),
          },
          {
            id: 'exec-2',
            workflowId: selectedWorkflow,
            status: 'success',
            startedAt: new Date(Date.now() - 7200000).toISOString(),
            stoppedAt: new Date(Date.now() - 7100000).toISOString(),
          },
          {
            id: 'exec-3',
            workflowId: selectedWorkflow,
            status: 'error',
            startedAt: new Date(Date.now() - 10800000).toISOString(),
            stoppedAt: new Date(Date.now() - 10700000).toISOString(),
          },
        ];
        setExecutions(mockExecutions);

        // Calculate stats
        const totalExecutions = mockExecutions.length;
        const successCount = mockExecutions.filter((e) => e.status === 'success').length;
        const errorCount = mockExecutions.filter((e) => e.status === 'error').length;
        const successRate = ((successCount / totalExecutions) * 100).toFixed(1);

        setStats({
          totalExecutions,
          successCount,
          errorCount,
          successRate,
        });
      } catch (error) {
        console.error('Error fetching executions:', error);
        toast.error('Error al cargar ejecuciones');
      }
    };

    fetchExecutions();
    const interval = setInterval(fetchExecutions, 30000); // Refetch every 30 seconds

    return () => clearInterval(interval);
  }, [selectedWorkflow]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'waiting':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-500">Exitoso</Badge>;
      case 'error':
        return <Badge className="bg-red-500">Error</Badge>;
      case 'waiting':
        return <Badge className="bg-yellow-500">Esperando</Badge>;
      default:
        return <Badge>Desconocido</Badge>;
    }
  };

  const executionData = executions.map((exec, idx) => ({
    name: `Ejecución ${idx + 1}`,
    status: exec.status === 'success' ? 1 : 0,
    timestamp: new Date(exec.startedAt).getTime(),
  }));

  const statusDistribution = [
    { name: 'Exitosas', value: stats.successCount || 0, fill: '#10b981' },
    { name: 'Errores', value: stats.errorCount || 0, fill: '#ef4444' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p className="text-gray-400">Cargando workflows...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Monitor de Workflows</h1>
        <p className="text-gray-400 mt-2">Monitoreo en tiempo real de workflows de n8n</p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="executions">Ejecuciones</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Total de Workflows</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{workflows.length}</div>
                <p className="text-xs text-gray-500 mt-1">
                  {workflows.filter((w) => w.active).length} activos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Ejecuciones Totales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalExecutions || 0}</div>
                <p className="text-xs text-gray-500 mt-1">Últimas 24 horas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Tasa de Éxito</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-500">{stats.successRate || 0}%</div>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.successCount || 0} exitosas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Errores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-500">{stats.errorCount || 0}</div>
                <p className="text-xs text-gray-500 mt-1">Requieren atención</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribución de Estados</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tendencia de Ejecuciones</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={executionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="status" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {workflows.map((workflow) => (
              <Card
                key={workflow.id}
                className={`cursor-pointer transition-all ${
                  selectedWorkflow === workflow.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' : ''
                }`}
                onClick={() => setSelectedWorkflow(workflow.id)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        {workflow.name}
                      </CardTitle>
                      <CardDescription>ID: {workflow.id}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {workflow.active ? (
                        <Badge className="bg-green-500">Activo</Badge>
                      ) : (
                        <Badge className="bg-gray-500">Inactivo</Badge>
                      )}
                      <Button size="sm" variant="outline">
                        {workflow.active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-400">
                    <p>Nodos: {workflow.nodes.length}</p>
                    <p>Última actualización: {new Date(workflow.updatedAt).toLocaleString('es-ES')}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="executions" className="space-y-4">
          {selectedWorkflow && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Ejecuciones de {workflows.find((w) => w.id === selectedWorkflow)?.name}
                </h3>
                <Button size="sm" onClick={() => toast.success('Workflow ejecutado')}>
                  <Play className="w-4 h-4 mr-2" />
                  Ejecutar Ahora
                </Button>
              </div>

              <div className="space-y-2">
                {executions.map((execution) => (
                  <Card key={execution.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(execution.status)}
                          <div>
                            <p className="font-medium">{execution.id}</p>
                            <p className="text-sm text-gray-400">
                              {new Date(execution.startedAt).toLocaleString('es-ES')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(execution.status)}
                          <span className="text-sm text-gray-400">
                            {Math.round(
                              (new Date(execution.stoppedAt).getTime() -
                                new Date(execution.startedAt).getTime()) /
                                1000
                            )}
                            s
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
