import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, ArrowUpRight } from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface Transaction {
  id: number;
  workflowId: number;
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed';
  description: string;
  createdAt: Date;
}

export function LiveTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Obtener transacciones en vivo
  const { data: liveTransactions, isLoading } = trpc.dashboard.transactions.useQuery(
    undefined,
    { refetchInterval: 2000 } // Actualizar cada 2 segundos
  );

  useEffect(() => {
    if (liveTransactions && Array.isArray(liveTransactions)) {
      setTransactions((liveTransactions as any[]).slice(0, 10) as Transaction[]);
    }
  }, [liveTransactions]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleString('es-ES', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const totalAmount = transactions.reduce((sum, t) => sum + (t.status === 'completed' ? t.amount : 0), 0);

  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Transacciones en Vivo
            </CardTitle>
            <CardDescription>Últimas transacciones procesadas</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalAmount, 'USD')}
            </div>
            <div className="text-xs text-gray-600">Hoy</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-2 font-semibold">Descripción</th>
                <th className="text-right py-2 px-2 font-semibold">Monto</th>
                <th className="text-center py-2 px-2 font-semibold">Estado</th>
                <th className="text-right py-2 px-2 font-semibold">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-500">
                    Cargando transacciones...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-500">
                    No hay transacciones registradas
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <ArrowUpRight className="w-4 h-4 text-green-600" />
                        <div>
                          <p className="font-medium text-gray-900">{tx.description}</p>
                          <p className="text-xs text-gray-500">Workflow #{tx.workflowId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-right py-3 px-2">
                      <span className="font-semibold text-green-600">
                        +{formatCurrency(tx.amount, tx.currency)}
                      </span>
                    </td>
                    <td className="text-center py-3 px-2">
                      <Badge className={getStatusColor(tx.status)}>
                        {tx.status === 'completed' ? 'Completada' : tx.status === 'pending' ? 'Pendiente' : 'Fallida'}
                      </Badge>
                    </td>
                    <td className="text-right py-3 px-2 text-gray-600">
                      {formatDate(tx.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pie de tabla con resumen */}
        {transactions.length > 0 && (
          <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-green-600">
                {transactions.filter((t) => t.status === 'completed').length}
              </div>
              <div className="text-xs text-gray-600">Completadas</div>
            </div>
            <div>
              <div className="text-lg font-bold text-yellow-600">
                {transactions.filter((t) => t.status === 'pending').length}
              </div>
              <div className="text-xs text-gray-600">Pendientes</div>
            </div>
            <div>
              <div className="text-lg font-bold text-red-600">
                {transactions.filter((t) => t.status === 'failed').length}
              </div>
              <div className="text-xs text-gray-600">Fallidas</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
