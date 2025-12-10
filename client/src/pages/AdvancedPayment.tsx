import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CreditCard, QrCode, Link2, CheckCircle2, Copy } from 'lucide-react';

export function AdvancedPayment() {
  const [activeTab, setActiveTab] = useState('credit-card');
  const [amount, setAmount] = useState('100');
  const [processing, setProcessing] = useState(false);

  // Tarjeta de crédito/débito
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('01');
  const [expiryYear, setExpiryYear] = useState('2026');
  const [cvv, setCvv] = useState('');

  // Código QR
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [qrPaymentId, setQrPaymentId] = useState<string | null>(null);

  // Link de pago
  const [paymentLink, setPaymentLink] = useState<string | null>(null);
  const [expirationHours, setExpirationHours] = useState('24');

  // Queries
  const { data: history } = trpc.advancedPayment.getPaymentHistory.useQuery({ limit: 10 });
  const { data: stats } = trpc.advancedPayment.getPaymentStats.useQuery();
  const { data: activeLinks } = trpc.advancedPayment.getActivePaymentLinks.useQuery();

  // Mutations
  const processCardMutation = trpc.advancedPayment.processCardPayment.useMutation({
    onSuccess: (result) => {
      setProcessing(false);
      if (result.status === 'completed') {
        alert(`✅ Pago completado: ${result.id}`);
        resetForm();
      } else {
        alert(`❌ Error: ${result.notification?.message || 'Error desconocido'}`);
      }
    },
    onError: (error) => {
      setProcessing(false);
      alert(`❌ Error: ${error.message}`);
    },
  });

  const generateQRMutation = trpc.advancedPayment.generateQRPayment.useMutation({
    onSuccess: (result) => {
      setQrCode(result.qrCode);
      setQrPaymentId(result.paymentId);
      alert(`✅ Código QR generado: ${result.paymentId}`);
    },
    onError: (error) => {
      alert(`❌ Error: ${error.message}`);
    },
  });

  const createLinkMutation = trpc.advancedPayment.createPaymentLink.useMutation({
    onSuccess: (result) => {
      setPaymentLink(result.url);
      alert(`✅ Link de pago creado`);
    },
    onError: (error) => {
      alert(`❌ Error: ${error.message}`);
    },
  });

  const processNotificationsMutation = trpc.advancedPayment.processNotifications.useMutation({
    onSuccess: (result) => {
      alert(`✅ ${result.processed} notificaciones procesadas`);
    },
  });

  const resetForm = () => {
    setCardNumber('');
    setCardHolder('');
    setExpiryMonth('01');
    setExpiryYear('2026');
    setCvv('');
    setAmount('100');
  };

  const handleProcessCard = async () => {
    if (!cardNumber || !cardHolder || !cvv || !amount) {
      alert('Por favor completa todos los campos');
      return;
    }

    setProcessing(true);
    processCardMutation.mutate({
      amount: parseFloat(amount),
      currency: 'USD',
      cardNumber,
      cardHolder,
      expiryMonth: parseInt(expiryMonth),
      expiryYear: parseInt(expiryYear),
      cvv,
      cardType: activeTab === 'credit-card' ? 'credit' : 'debit',
    });
  };

  const handleGenerateQR = async () => {
    if (!amount) {
      alert('Por favor ingresa un monto');
      return;
    }

    generateQRMutation.mutate({
      amount: parseFloat(amount),
      currency: 'USD',
      recipientName: 'Tu Nombre',
      description: `Pago de ${amount} USD`,
    });
  };

  const handleCreateLink = async () => {
    if (!amount) {
      alert('Por favor ingresa un monto');
      return;
    }

    createLinkMutation.mutate({
      amount: parseFloat(amount),
      currency: 'USD',
      recipientName: 'Tu Nombre',
      description: `Pago de ${amount} USD`,
      expirationHours: parseInt(expirationHours),
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">💳 Sistema de Pagos Avanzado</h1>
          <p className="text-slate-400">
            4 opciones de pago: Tarjeta de Crédito, Tarjeta de Débito, Código QR y Link de Pago
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Methods */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6 bg-slate-800">
                <TabsTrigger value="credit-card" className="text-white">
                  💳 Crédito
                </TabsTrigger>
                <TabsTrigger value="debit-card" className="text-white">
                  💳 Débito
                </TabsTrigger>
                <TabsTrigger value="qr-code" className="text-white">
                  📱 QR
                </TabsTrigger>
                <TabsTrigger value="payment-link" className="text-white">
                  🔗 Link
                </TabsTrigger>
              </TabsList>

              {/* Tarjeta de Crédito */}
              <TabsContent value="credit-card" className="space-y-6">
                <Card className="border-slate-700 bg-slate-800">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Tarjeta de Crédito
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Ingresa los detalles de tu tarjeta de crédito
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Número de Tarjeta
                      </label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value.replace(/\s/g, ''))}
                        placeholder="4111 1111 1111 1111"
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Titular
                      </label>
                      <input
                        type="text"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        placeholder="Diego Cortez"
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Mes
                        </label>
                        <select
                          value={expiryMonth}
                          onChange={(e) => setExpiryMonth(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        >
                          {Array.from({ length: 12 }, (_, i) => (
                            <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                              {String(i + 1).padStart(2, '0')}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Año
                        </label>
                        <select
                          value={expiryYear}
                          onChange={(e) => setExpiryYear(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        >
                          {Array.from({ length: 10 }, (_, i) => {
                            const year = new Date().getFullYear() + i;
                            return (
                              <option key={year} value={String(year)}>
                                {year}
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          CVV
                        </label>
                        <input
                          type="text"
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value)}
                          placeholder="123"
                          maxLength={4}
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <Button
                      onClick={handleProcessCard}
                      disabled={processing}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {processing ? '⏳ Procesando...' : '💳 Procesar Pago'}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tarjeta de Débito */}
              <TabsContent value="debit-card" className="space-y-6">
                <Card className="border-slate-700 bg-slate-800">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Tarjeta de Débito
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Ingresa los detalles de tu tarjeta de débito
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Número de Tarjeta
                      </label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value.replace(/\s/g, ''))}
                        placeholder="4111 1111 1111 1111"
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Titular
                      </label>
                      <input
                        type="text"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        placeholder="Diego Cortez"
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Mes
                        </label>
                        <select
                          value={expiryMonth}
                          onChange={(e) => setExpiryMonth(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        >
                          {Array.from({ length: 12 }, (_, i) => (
                            <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                              {String(i + 1).padStart(2, '0')}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Año
                        </label>
                        <select
                          value={expiryYear}
                          onChange={(e) => setExpiryYear(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        >
                          {Array.from({ length: 10 }, (_, i) => {
                            const year = new Date().getFullYear() + i;
                            return (
                              <option key={year} value={String(year)}>
                                {year}
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          CVV
                        </label>
                        <input
                          type="text"
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value)}
                          placeholder="123"
                          maxLength={4}
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <Button
                      onClick={handleProcessCard}
                      disabled={processing}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                    >
                      {processing ? '⏳ Procesando...' : '💳 Procesar Pago'}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Código QR */}
              <TabsContent value="qr-code" className="space-y-6">
                <Card className="border-slate-700 bg-slate-800">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <QrCode className="w-5 h-5" />
                      Código QR para Pago
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Genera un código QR que otros pueden escanear para pagarte
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Monto (USD)
                      </label>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="100"
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <Button
                      onClick={handleGenerateQR}
                      disabled={generateQRMutation.isPending}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      {generateQRMutation.isPending ? '⏳ Generando...' : '📱 Generar Código QR'}
                    </Button>

                    {qrCode && (
                      <div className="p-4 bg-slate-700 rounded-lg text-center">
                        <img src={qrCode} alt="QR Code" className="w-48 h-48 mx-auto mb-4" />
                        <p className="text-slate-400 text-sm mb-2">ID: {qrPaymentId}</p>
                        <Button
                          variant="outline"
                          className="w-full text-white border-slate-600 hover:bg-slate-600"
                          onClick={() => navigator.clipboard.writeText(qrCode)}
                        >
                          📋 Copiar QR
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Link de Pago */}
              <TabsContent value="payment-link" className="space-y-6">
                <Card className="border-slate-700 bg-slate-800">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Link2 className="w-5 h-5" />
                      Link de Pago Dinámico
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Crea un link que otros pueden usar para pagarte
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Monto (USD)
                      </label>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="100"
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Expira en (horas)
                      </label>
                      <select
                        value={expirationHours}
                        onChange={(e) => setExpirationHours(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="1">1 hora</option>
                        <option value="6">6 horas</option>
                        <option value="24">24 horas</option>
                        <option value="72">72 horas</option>
                        <option value="168">1 semana</option>
                      </select>
                    </div>

                    <Button
                      onClick={handleCreateLink}
                      disabled={createLinkMutation.isPending}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      {createLinkMutation.isPending ? '⏳ Creando...' : '🔗 Crear Link de Pago'}
                    </Button>

                    {paymentLink && (
                      <div className="p-4 bg-slate-700 rounded-lg">
                        <p className="text-slate-400 text-sm mb-2">Tu link de pago:</p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={paymentLink}
                            readOnly
                            className="flex-1 px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-sm"
                          />
                          <Button
                            variant="outline"
                            className="text-white border-slate-600 hover:bg-slate-600"
                            onClick={() => navigator.clipboard.writeText(paymentLink)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Monto */}
            <Card className="border-slate-700 bg-slate-800 sticky top-8">
              <CardHeader>
                <CardTitle className="text-white">Monto a Pagar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-green-400 mb-4">
                  ${parseFloat(amount || '0').toFixed(2)}
                </div>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  placeholder="100"
                />
              </CardContent>
            </Card>

            {/* Estadísticas */}
            {stats && (
              <Card className="border-slate-700 bg-slate-800">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Estadísticas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Pagos:</span>
                    <span className="text-white font-medium">{stats.totalPayments}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Completados:</span>
                    <span className="text-green-400 font-medium">{stats.completedPayments}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tasa Éxito:</span>
                    <span className="text-blue-400 font-medium">{stats.successRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Monto Total:</span>
                    <span className="text-green-400 font-medium">${stats.totalAmount.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Botón de Notificaciones */}
            <Button
              onClick={() => processNotificationsMutation.mutate()}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white"
            >
              📢 Procesar Notificaciones
            </Button>
          </div>
        </div>

        {/* Historial */}
        {history && history.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-white mb-4">Historial de Pagos</h2>
            <div className="space-y-3">
              {history.map((payment) => (
                <Card key={payment.id} className="border-slate-700 bg-slate-800">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-white font-medium">
                          ${payment.amount} {payment.currency}
                        </p>
                        <p className="text-sm text-slate-400">
                          {payment.method.replace(/_/g, ' ').toUpperCase()}
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(payment.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {payment.status === 'completed' ? (
                          <Badge className="bg-green-600">✅ Completado</Badge>
                        ) : payment.status === 'failed' ? (
                          <Badge className="bg-red-600">❌ Fallido</Badge>
                        ) : (
                          <Badge className="bg-yellow-600">⏳ Pendiente</Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
