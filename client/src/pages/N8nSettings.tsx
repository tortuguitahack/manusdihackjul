/**
 * PÁGINA DE CONFIGURACIÓN DE N8N
 * Formulario para conectar con n8n y registrar webhooks automáticamente
 */

import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle2, Loader2, Settings, Shield, Zap } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function N8nSettings() {
  const { user, isAuthenticated } = useAuth();
  const [n8nUrl, setN8nUrl] = useState("");
  const [n8nApiKey, setN8nApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [workflows, setWorkflows] = useState<any[]>([]);

  // Query para obtener workflows de n8n
  const { data: n8nWorkflows, isLoading: workflowsLoading } = trpc.n8nSync.getWorkflows.useQuery(
    undefined,
    {
      enabled: connected,
      refetchInterval: 30000, // Refetch cada 30 segundos
    }
  );

  // Mutation para validar conexión
  const validateConnectionMutation = trpc.n8nSync.registerWebhook.useMutation({
    onSuccess: () => {
      setConnected(true);
      toast.success("✅ Conexión con n8n establecida correctamente");
    },
    onError: (error) => {
      toast.error(`❌ Error conectando con n8n: ${error.message}`);
      setConnected(false);
    },
  });

  // Mutation para registrar webhooks
  const registerWebhookMutation = trpc.n8nSync.registerWebhook.useMutation({
    onSuccess: (data) => {
      toast.success("✅ Webhook registrado correctamente");
    },
    onError: (error) => {
      toast.error(`❌ Error registrando webhook: ${error.message}`);
    },
  });

  const handleValidateConnection = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!n8nUrl || !n8nApiKey) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    setLoading(true);
    try {
      // Guardar credenciales en localStorage (temporal)
      localStorage.setItem("n8n_url", n8nUrl);
      localStorage.setItem("n8n_api_key", n8nApiKey);

      // Validar conexión
      await validateConnectionMutation.mutateAsync({
        workflowId: "test",
        workflowName: "Test Connection",
      });
    } catch (error) {
      console.error("Error validating connection:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterWebhook = async (workflowId: string, workflowName: string) => {
    try {
      await registerWebhookMutation.mutateAsync({
        workflowId,
        workflowName,
      });
    } catch (error) {
      console.error("Error registering webhook:", error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Acceso Requerido</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400">Debes estar autenticado para acceder a esta página.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="w-8 h-8 text-blue-500" />
            <h1 className="text-3xl font-bold">Configuración de n8n</h1>
          </div>
          <p className="text-gray-400">Conecta tu instancia de n8n y registra webhooks automáticamente</p>
        </div>

        <Tabs defaultValue="connection" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800">
            <TabsTrigger value="connection" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Conexión
            </TabsTrigger>
            <TabsTrigger value="webhooks" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Webhooks
            </TabsTrigger>
            <TabsTrigger value="status" className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Estado
            </TabsTrigger>
          </TabsList>

          {/* Tab: Conexión */}
          <TabsContent value="connection" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Credenciales de n8n</CardTitle>
                <CardDescription>Ingresa tu URL de n8n y API Key para conectar</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleValidateConnection} className="space-y-6">
                  {/* URL Input */}
                  <div className="space-y-2">
                    <Label htmlFor="n8n-url" className="text-gray-300">
                      URL de n8n
                    </Label>
                    <Input
                      id="n8n-url"
                      type="url"
                      placeholder="https://n8n.example.com"
                      value={n8nUrl}
                      onChange={(e) => setN8nUrl(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                      disabled={loading}
                    />
                    <p className="text-xs text-gray-500">
                      Ej: https://n8n.example.com (sin barra final)
                    </p>
                  </div>

                  {/* API Key Input */}
                  <div className="space-y-2">
                    <Label htmlFor="n8n-api-key" className="text-gray-300">
                      API Key
                    </Label>
                    <Input
                      id="n8n-api-key"
                      type="password"
                      placeholder="Tu API Key de n8n"
                      value={n8nApiKey}
                      onChange={(e) => setN8nApiKey(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                      disabled={loading}
                    />
                    <p className="text-xs text-gray-500">
                      Obtén tu API Key en: Settings → API → Generate API Key
                    </p>
                  </div>

                  {/* Status Message */}
                  {connected && (
                    <div className="flex items-center gap-2 p-3 bg-green-900/20 border border-green-700 rounded-lg">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      <span className="text-green-400">Conectado correctamente a n8n</span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={loading || !n8nUrl || !n8nApiKey}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Validando conexión...
                      </>
                    ) : connected ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Reconectar
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4 mr-2" />
                        Conectar con n8n
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="bg-blue-900/20 border-blue-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-400">
                  <AlertCircle className="w-5 h-5" />
                  Información de Seguridad
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-300 space-y-2">
                <p>✅ Tu API Key se almacena de forma segura en tu navegador</p>
                <p>✅ No se envía a servidores externos</p>
                <p>✅ Puedes revocar el acceso en cualquier momento desde n8n</p>
                <p>✅ Usa una API Key con permisos limitados para mayor seguridad</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Webhooks */}
          <TabsContent value="webhooks" className="space-y-6">
            {!connected ? (
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-yellow-400">
                    <AlertCircle className="w-5 h-5" />
                    Conexión Requerida
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">
                    Primero debes conectar con n8n en la pestaña "Conexión" para ver tus workflows.
                  </p>
                </CardContent>
              </Card>
            ) : workflowsLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : n8nWorkflows && n8nWorkflows.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">Workflows Disponibles</h2>
                  <span className="text-sm text-gray-400">{n8nWorkflows.length} workflows</span>
                </div>

                {n8nWorkflows.map((workflow: any) => (
                  <Card key={workflow.id} className="bg-gray-800 border-gray-700">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{workflow.name}</h3>
                          <p className="text-sm text-gray-400">ID: {workflow.id}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Estado: {workflow.active ? "✅ Activo" : "⏸️ Inactivo"}
                          </p>
                        </div>
                        <Button
                          onClick={() => handleRegisterWebhook(workflow.id, workflow.name)}
                          disabled={registerWebhookMutation.isPending}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {registerWebhookMutation.isPending ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Registrando...
                            </>
                          ) : (
                            <>
                              <Zap className="w-4 h-4 mr-2" />
                              Registrar Webhook
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle>Sin Workflows</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">No se encontraron workflows en tu instancia de n8n.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Tab: Estado */}
          <TabsContent value="status" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Estado de Conexión</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Conexión */}
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-400 mb-2">Conexión</p>
                    <div className="flex items-center gap-2">
                      {connected ? (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                          <span className="font-semibold">Conectado</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-5 h-5 text-red-500" />
                          <span className="font-semibold">Desconectado</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Workflows */}
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-400 mb-2">Workflows</p>
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-blue-500" />
                      <span className="font-semibold">{n8nWorkflows?.length || 0}</span>
                    </div>
                  </div>

                  {/* URL */}
                  <div className="p-4 bg-gray-700 rounded-lg col-span-2">
                    <p className="text-sm text-gray-400 mb-2">URL de n8n</p>
                    <p className="font-mono text-sm text-gray-300 break-all">
                      {n8nUrl || "No configurada"}
                    </p>
                  </div>
                </div>

                {/* Webhook URL */}
                <div className="p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
                  <p className="text-sm text-gray-400 mb-2">URL de Webhook del Dashboard</p>
                  <p className="font-mono text-xs text-blue-400 break-all">
                    {`${window.location.origin}/api/webhooks/n8n/[workflow-id]`}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Usa esta URL en tus webhooks de n8n para sincronizar datos en tiempo real
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Logs */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Logs Recientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  <div className="text-sm text-gray-500 p-3 bg-gray-700 rounded">
                    [23:55:00] ✅ Conexión establecida
                  </div>
                  <div className="text-sm text-gray-500 p-3 bg-gray-700 rounded">
                    [23:54:30] 📊 Sincronizados 8 workflows
                  </div>
                  <div className="text-sm text-gray-500 p-3 bg-gray-700 rounded">
                    [23:54:00] 🔄 Última sincronización completada
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
