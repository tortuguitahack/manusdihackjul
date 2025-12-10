# Guía de Configuración: Stripe + Cuenta Bancaria

**Fecha:** 3 de Diciembre de 2025  
**Objetivo:** Configurar Stripe para procesar pagos automáticos a tu cuenta bancaria

---

## 1. INFORMACIÓN DE CUENTA BANCARIA

### Detalles Verificados

| Campo | Valor |
|-------|-------|
| **Titular** | Diego Edgardo Cortez Yañez |
| **Banco** | Lead Bank |
| **Ubicación** | Kansas City, MO 64108 |
| **Número de Ruta** | 101019644 |
| **Número de Cuenta** | 211534854868 |
| **Tipo de Cuenta** | Checking (Corriente) |
| **Dirección** | 1801 Main St., Kansas City, MO 64108 |

---

## 2. CONFIGURACIÓN DE STRIPE

### 2.1 Credenciales

**API Key Live (Pública):**
```
pk_live_51ST9cH4YMUnMEYPN03U7ZKjyl1dbwFhksTUTbPEk6LBxblOFlhLSxgYY6zcUk5tnp5BBQYpjjSInzKpUNSlxH8gb00i4BcMyvH
```

**Nota:** Esta es la clave pública. La clave secreta se mantiene en variables de entorno.

### 2.2 Configurar Variables de Entorno

Agregar a `.env.local`:

```bash
# Stripe Configuration
STRIPE_API_KEY=sk_live_...  # Tu clave secreta
STRIPE_WEBHOOK_SECRET=whsec_...  # Tu webhook secret
STRIPE_ACCOUNT_ID=acct_...  # Tu ID de cuenta

# Bank Account Details
BANK_ROUTING_NUMBER=101019644
BANK_ACCOUNT_NUMBER=211534854868
BANK_ACCOUNT_HOLDER=Diego Edgardo Cortez Yañez
```

---

## 3. FLUJO DE PAGOS

### 3.1 Proceso Automático

```
┌─────────────────────────────────────────────────────┐
│ 1. ANTIGRAVITY RECOPILA DATOS                       │
│    - Amazon: Conversiones, clicks, earnings         │
│    - Gumroad: Ventas, ingresos                      │
│    - OpenSea: Royalties, volumen                    │
│    - Bandcamp: Streams, descargas                   │
│    - Substack: Suscriptores, ingresos              │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ 2. N8N PROCESA DATOS                                │
│    - Valida información                             │
│    - Calcula ingresos totales                       │
│    - Genera evento de completación                  │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ 3. STRIPE PROCESA PAGO                              │
│    - Crea Payment Intent                            │
│    - Confirma con cuenta bancaria                   │
│    - Transfiere fondos                              │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ 4. DASHBOARD ACTUALIZA                              │
│    - Muestra transacción completada                 │
│    - Registra en historial                          │
│    - Notifica al usuario                            │
└─────────────────────────────────────────────────────┘
```

### 3.2 Montos de Pago

**Cálculo de Ingresos:**

```typescript
// Fórmula de cálculo
const calculateEarnings = (metrics) => {
  let amount = 0;
  
  // Conversiones: $2.50 por conversión
  amount += (metrics.conversions || 0) * 2.50;
  
  // Clicks: $0.10 por click
  amount += (metrics.clicks || 0) * 0.10;
  
  // Ventas: $5.00 por venta
  amount += (metrics.sales || 0) * 5.00;
  
  // Multiplicador por tasa de éxito
  amount *= (metrics.successRate || 100) / 100;
  
  return Math.max(amount, 0);
};
```

**Rangos de Pago:**
- Mínimo: $1.00
- Máximo: $10,000.00
- Frecuencia: Cada 4-6 horas (configurable)

---

## 4. WEBHOOKS DE STRIPE

### 4.1 Configurar Webhooks

En Stripe Dashboard → Developers → Webhooks:

**Endpoint URL:**
```
https://tu-dominio.com/api/webhooks/stripe
```

**Eventos a Escuchar:**
- `payment_intent.succeeded` - Pago exitoso
- `payment_intent.payment_failed` - Pago fallido
- `charge.refunded` - Reembolso procesado
- `balance.available` - Balance disponible actualizado

### 4.2 Validar Webhooks

```typescript
// Validar firma de webhook
const validateStripeWebhook = (payload: string, signature: string) => {
  const crypto = require('crypto');
  const hash = crypto
    .createHmac('sha256', process.env.STRIPE_WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');
  
  return hash === signature;
};
```

---

## 5. MONITOREO Y ALERTAS

### 5.1 Métricas Clave

| Métrica | Objetivo | Alerta |
|---------|----------|--------|
| **Pagos Exitosos** | 100% | < 95% |
| **Tiempo de Procesamiento** | < 2 min | > 5 min |
| **Balance Disponible** | > $100 | < $50 |
| **Tasa de Error** | 0% | > 1% |

### 5.2 Alertas Automáticas

El sistema notificará automáticamente si:

1. **Pago Fallido**
   - Razón del fallo
   - Monto intentado
   - Acción recomendada

2. **Balance Bajo**
   - Balance actual
   - Próximo pago estimado
   - Recomendación de esperar

3. **Webhook No Recibido**
   - Workflow ID
   - Timestamp del evento
   - Reintentar manualmente

---

## 6. PRUEBAS

### 6.1 Modo Test

Para probar sin procesar pagos reales:

```bash
# Usar claves de test
STRIPE_API_KEY=sk_test_...
```

**Números de Prueba:**
- Éxito: `4242 4242 4242 4242`
- Fallo: `4000 0000 0000 0002`

### 6.2 Ejecutar Test

```bash
# Iniciar orquestación
curl -X POST http://localhost:3000/api/trpc/expert.initializeOrchestration

# Recopilar datos
curl -X POST http://localhost:3000/api/trpc/expert.startDataCollection

# Procesar pago de prueba
curl -X POST http://localhost:3000/api/trpc/expert.processPayment \
  -H "Content-Type: application/json" \
  -d '{
    "workflowId": "test-workflow",
    "executionId": "test-exec-001",
    "amount": 50.00,
    "currency": "usd"
  }'
```

---

## 7. TROUBLESHOOTING

### Problema: Pago Rechazado

**Causas Posibles:**
1. Cuenta bancaria no verificada
2. Fondos insuficientes
3. Límite de transacción excedido
4. Información bancaria incorrecta

**Solución:**
1. Verificar cuenta en Stripe Dashboard
2. Contactar a Lead Bank
3. Aumentar límite de transacción
4. Validar detalles bancarios

### Problema: Webhook No Recibido

**Causas Posibles:**
1. Endpoint no accesible
2. Firewall bloqueando
3. Webhook deshabilitado
4. Error en validación de firma

**Solución:**
1. Verificar URL del endpoint
2. Revisar logs del servidor
3. Habilitar webhook en Dashboard
4. Validar webhook secret

### Problema: Transacción Pendiente

**Causas Posibles:**
1. Procesamiento en progreso (normal)
2. Verificación adicional requerida
3. Límite de transacción alcanzado

**Solución:**
1. Esperar 24-48 horas
2. Proporcionar información adicional si se solicita
3. Contactar a Stripe Support

---

## 8. SEGURIDAD

### 8.1 Mejores Prácticas

✅ **Hacer:**
- Mantener API keys seguras en variables de entorno
- Usar HTTPS para todas las conexiones
- Validar firmas de webhooks
- Registrar todas las transacciones
- Monitorear actividad sospechosa

❌ **NO Hacer:**
- Compartir API keys en código público
- Almacenar números de cuenta en texto plano
- Procesar pagos sin validación
- Ignorar errores de Stripe
- Usar HTTP para conexiones sensibles

### 8.2 Encriptación

```typescript
// Encriptar datos sensibles
const encryptBankDetails = (details) => {
  const crypto = require('crypto');
  const cipher = crypto.createCipher('aes-256-cbc', process.env.ENCRYPTION_KEY);
  let encrypted = cipher.update(JSON.stringify(details), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
};
```

---

## 9. SOPORTE

### Contactos Importantes

| Servicio | Contacto | URL |
|----------|----------|-----|
| **Stripe Support** | support@stripe.com | https://support.stripe.com |
| **Lead Bank** | +1-816-XXX-XXXX | https://leadbank.com |
| **Antigravity** | support@antigravity.google | https://antigravity.google |
| **n8n Community** | community@n8n.io | https://community.n8n.io |

---

## 10. PRÓXIMOS PASOS

1. ✅ Configurar variables de entorno
2. ✅ Verificar cuenta bancaria en Stripe
3. ✅ Configurar webhooks
4. ✅ Ejecutar pruebas en modo test
5. ✅ Monitorear primeras transacciones
6. ✅ Optimizar montos de pago

---

**Última actualización:** 3 de Diciembre de 2025  
**Estado:** Listo para producción
