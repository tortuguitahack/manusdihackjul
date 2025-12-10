import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface Event {
  id: number;
  eventType: string;
  workflowId: number;
  userId: number;
  status: 'success' | 'error' | 'pending';
  data: Record<string, any>;
  timestamp: Date;
}

export function RealtimeEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filter, setFilter] = useState<string>('all');

  // Obtener eventos iniciales
  const { data: initialEvents, isLoading } = trpc.webhooks.getRecentEvents.useQuery(
    { limit: 20, source: filter === 'all' ? undefined : (filter as any) },
    { refetchInterval: 3000 } // Actualizar cada 3 segundos
  );

  useEffect(() => {
    if (initialEvents && Array.isArray(initialEvents)) {
      setEvents(initialEvents as Event[]);
    }
  }, [initialEvents]);

  const getEventIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getEventColor = (eventType: string) => {
    if (eventType.includes('workflow')) return 'bg-blue-500/10 text-blue-700';
    if (eventType.includes('payment')) return 'bg-green-500/10 text-green-700';
    if (eventType.includes('affiliate')) return 'bg-purple-500/10 text-purple-700';
    if (eventType.includes('nft')) return 'bg-pink-500/10 text-pink-700';
    return 'bg-gray-500/10 text-gray-700';
  };

  const formatTimestamp = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const eventTypes = ['all', 'workflow:started', 'workflow:completed', 'payment:received', 'affiliate:commission', 'nft:minted'];

  return (
    <Card className="col-span-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Eventos en Tiempo Real
            </CardTitle>
            <CardDescription>Actividad del ecosistema actualizada en vivo</CardDescription>
          </div>
          <TrendingUp className="w-5 h-5 text-green-500" />
        </div>
      </CardHeader>
      <CardContent>
        {/* Filtros */}
        <div className="mb-6 flex flex-wrap gap-2">
          {eventTypes.map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-1 rounded-full text-sm transition-all ${
                filter === type
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {type === 'all' ? 'Todos' : type.split(':')[1] || type}
            </button>
          ))}
        </div>

        {/* Lista de eventos */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">
              Cargando eventos...
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay eventos registrados
            </div>
          ) : (
            events.map((event) => (
              <div
                key={event.id}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="mt-1">{getEventIcon(event.status)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={getEventColor(event.eventType)}>
                      {event.eventType}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {formatTimestamp(event.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Workflow #{event.workflowId} • Usuario #{event.userId}
                  </p>
                  {event.data && Object.keys(event.data).length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      {JSON.stringify(event.data).substring(0, 100)}...
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Estadísticas */}
        <div className="mt-6 pt-4 border-t grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {events.filter((e) => e.status === 'success').length}
            </div>
            <div className="text-xs text-gray-600">Exitosos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {events.filter((e) => e.status === 'error').length}
            </div>
            <div className="text-xs text-gray-600">Errores</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {events.length}
            </div>
            <div className="text-xs text-gray-600">Total</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
