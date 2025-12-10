import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Loader2, BarChart3, Zap, TrendingUp } from "lucide-react";
import { APP_TITLE, getLoginUrl } from "@/const";
import { useLocation } from "wouter";

/**
 * Landing page del Ecosistema de Automatización
 */
export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [, navigate] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <Loader2 className="animate-spin w-8 h-8 text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-8 h-8 text-blue-500" />
          <span className="text-2xl font-bold">{APP_TITLE}</span>
        </div>
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <span className="text-gray-300">Bienvenido, {user?.name}</span>
              <Button
                onClick={() => navigate("/")}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Dashboard
              </Button>
              <Button variant="outline" onClick={logout}>
                Logout
              </Button>
            </>
          ) : (
            <Button
              onClick={() => (window.location.href = getLoginUrl())}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Iniciar Sesion
            </Button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              Automatiza tu negocio y genera ingresos pasivos
            </h1>
            <p className="text-xl text-gray-400 mb-8">
              Un ecosistema completo de workflows automatizados que generan entre
              $4,000 y $28,000 mensuales sin intervención manual.
            </p>
            <div className="flex gap-4">
              {isAuthenticated ? (
                <Button
                  onClick={() => navigate("/dashboard")}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Ir al Dashboard
                </Button>
              ) : (
                <Button
                  onClick={() => (window.location.href = getLoginUrl())}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Comenzar Ahora
                </Button>
              )}
              <Button variant="outline" size="lg">
                Ver Documentacion
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <TrendingUp className="w-8 h-8 text-green-500 mb-3" />
              <h3 className="font-semibold mb-2">8 Workflows</h3>
              <p className="text-sm text-gray-400">Completamente automatizados</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <Zap className="w-8 h-8 text-yellow-500 mb-3" />
              <h3 className="font-semibold mb-2">Tiempo Real</h3>
              <p className="text-sm text-gray-400">Monitoreo en vivo</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 lg:col-span-2">
              <BarChart3 className="w-8 h-8 text-blue-500 mb-3" />
              <h3 className="font-semibold mb-2">Dashboard Avanzado</h3>
              <p className="text-sm text-gray-400">Visualizacion completa de metricas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-800/50 border-t border-gray-700 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12 text-center">
            Sistemas de Ingresos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-900 rounded-lg p-8 border border-gray-700">
              <h3 className="text-xl font-semibold mb-3">Contenido Automatizado</h3>
              <ul className="space-y-2 text-gray-400">
                <li>✓ Videos para Amazon Influencer</li>
                <li>✓ Imagenes de stock con IA</li>
                <li>✓ Plantillas de Notion</li>
                <li>✓ Diseños para Redbubble</li>
              </ul>
            </div>
            <div className="bg-gray-900 rounded-lg p-8 border border-gray-700">
              <h3 className="text-xl font-semibold mb-3">Productos Digitales</h3>
              <ul className="space-y-2 text-gray-400">
                <li>✓ NFTs en OpenSea</li>
                <li>✓ Loops de audio en Bandcamp</li>
                <li>✓ Newsletters monetizadas</li>
                <li>✓ APIs de pago</li>
              </ul>
            </div>
            <div className="bg-gray-900 rounded-lg p-8 border border-gray-700">
              <h3 className="text-xl font-semibold mb-3">Finanzas Descentralizadas</h3>
              <ul className="space-y-2 text-gray-400">
                <li>✓ Yield farming automatico</li>
                <li>✓ Affiliate marketing</li>
                <li>✓ Suscripciones premium</li>
                <li>✓ Monetizacion de APIs</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-bold mb-6">
          Listo para automatizar tu negocio?
        </h2>
        <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
          Unete a nuestro ecosistema y comienza a generar ingresos pasivos con
          workflows completamente automatizados.
        </p>
        {!isAuthenticated && (
          <Button
            onClick={() => (window.location.href = getLoginUrl())}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700"
          >
            Comenzar Ahora
          </Button>
        )}
      </div>
    </div>
  );
}
