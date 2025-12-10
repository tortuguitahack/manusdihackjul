/**
 * PÁGINA DE INTEGRACIONES
 * Panel completo de control de todas las integraciones
 */

import React from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import IntegrationsPanel from '@/components/IntegrationsPanel';
import { Loader2 } from 'lucide-react';

export default function Integrations() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400">Por favor inicia sesión para acceder a las integraciones</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-black p-6">
      <IntegrationsPanel />
    </div>
  );
}
