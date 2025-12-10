# Integración Experta: Antigravity + n8n + Stripe

**Fecha:** 3 de Diciembre de 2025  
**Objetivo:** Control centralizado de workflows monetizables con orquestación inteligente

---

## 1. ARQUITECTURA GENERAL

### 1.1 Componentes Principales

```
┌─────────────────────────────────────────────────────────────┐
│                    ANTIGRAVITY (ORQUESTADOR)                │
│  - Agent Manager: Coordina múltiples agentes                │
│  - Browser Agent: Recopila datos de la web                  │
│  - Task Groups: Ejecuta workflows complejos                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
    ┌────────┐    ┌────────┐    ┌──────────┐
    │  N8N   │    │ STRIPE │    │ DASHBOARD│
    │Workflows│   │Payments│    │ Control  │
    └────────┘    └────────┘    └──────────┘
        │              │              │
        └──────────────┼──────────────┘
                       │
                ┌──────▼──────┐
                │  DATABASE   │
                │  (Métricas) │
                └─────────────┘
```

### 1.2 Flujo de Datos

1. **Antigravity** recopila datos de la web y monitorea workflows
2. **n8n** ejecuta workflows automatizados con webhooks bidireccionales
3. **Stripe** procesa pagos y gestiona transacciones
4. **Dashboard** muestra métricas en tiempo real
5. **Base de datos** almacena historial y análisis

---

## 2. ANTIGRAVITY COMO ORQUESTADOR CENTRAL

### 2.1 Capacidades Clave

| Capacidad | Descripción | Caso de Uso |
|-----------|-------------|-----------|
| **Agent Manager** | Coordina múltiples agentes en paralelo | Monitorear 8 workflows simultáneamente |
| **Browser Agent** | Navega y extrae datos de sitios web | Recopilar datos de Amazon, Gumroad, OpenSea |
| **Task Groups** | Agrupa tareas complejas en flujos | Ejecutar secuencia: Recopilación → Procesamiento → Pago |
| **Artifacts** | Crea reportes y documentación automática | Generar reportes de ingresos diarios |
| **Asynchronous Agents** | Trabaja en paralelo sin bloqueos | Múltiples workflows ejecutándose simultáneamente |

### 2.2 Integración con n8n

**Antigravity → n8n Flow:**

```typescript
// Antigravity Agent Task
const orchestrateWorkflows = async () => {
  // 1. Recopilar datos de la web
  const webData = await browserAgent.scrapeData({
    urls: ['amazon.com', 'gumroad.com', 'opensea.io'],
    selectors: ['price', 'sales', 'conversions']
  });

  // 2. Enviar a n8n para procesamiento
  const n8nResponse = await fetch('http://localhost:5678/webhook/process-data', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${N8N_API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      workflowId: 'data-processor',
      data: webData,
      timestamp: new Date().toISOString()
    })
  });

  // 3. Monitorear ejecución
  const execution = await n8nResponse.json();
  taskGroup.addTask({
    name: 'Monitor Workflow',
    status: execution.status,
    executionId: execution.id
  });

  return execution;
};
```

---

## 3. N8N - CONTROL DE WORKFLOWS

### 3.1 Configuración de API

**Token JWT de n8n:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0ZmM1YjdhNS00MTY3LTQ3MDItODMwOS0zNDIyMWNkMDM5ZjEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzY0MzY5NjIwfQ.ZRAdQZeWY_R0v_K4ugdF96LF_sFTZaYdVgJjdBzZvIw
```

**Endpoints Disponibles:**
- `GET /api/v1/workflows` - Listar workflows
- `POST /api/v1/workflows/{id}/execute` - Ejecutar workflow
- `GET /api/v1/executions` - Historial de ejecuciones
- `POST /api/v1/webhooks` - Registrar webhooks

### 3.2 Webhooks Bidireccionales

**Webhook de n8n → Dashboard:**

```typescript
// server/routers/n8nWebhooks.ts
export const n8nWebhooksRouter = router({
  receiveEvent: publicProcedure
    .input(z.object({
      workflowId: z.string(),
      executionId: z.string(),
      status: z.enum(['success', 'failed', 'running']),
      data: z.record(z.any()),
      earnings: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      // Guardar en BD
      await db.insert(webhookEvents).values({
        source: 'n8n',
        eventId: input.executionId,
        eventType: `workflow_${input.status}`,
        payload: input,
        processed: true,
      });

      // Notificar a Antigravity
      await antigravityAgent.notify({
        type: 'workflow_completed',
        data: input
      });

      return { success: true };
    }),
});
```

---

## 4. STRIPE - PROCESAMIENTO DE PAGOS

### 4.1 Configuración

**API Key Live:**
```
pk_live_51ST9cH4YMUnMEYPN03U7ZKjyl1dbwFhksTUTbPEk6LBxblOFlhLSxgYY6zcUk5tnp5BBQYpjjSInzKpUNSlxH8gb00i4BcMyvH
```

**Información Bancaria:**
- Titular: Diego Edgardo Cortez Yañez
- Banco: Lead Bank (Kansas City, MO)
- Número de Ruta: 101019644
- Número de Cuenta: 211534854868
- Tipo: Checking

### 4.2 Integración con Workflows

**Flow: Workflow Completado → Pago Procesado**

```typescript
// server/integrations/stripePaymentProcessor.ts
export class StripePaymentProcessor {
  private stripe = new Stripe(process.env.STRIPE_API_KEY);

  async processWorkflowPayment(execution: WorkflowExecution) {
    // 1. Calcular monto basado en resultados
    const amount = this.calculateAmount(execution);

    // 2. Crear Payment Intent
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // En centavos
      currency: 'usd',
      payment_method_types: ['us_bank_account'],
      metadata: {
        workflowId: execution.workflowId,
        executionId: execution.executionId,
        earnings: execution.earnings,
      },
    });

    // 3. Confirmar pago
    const confirmed = await this.stripe.paymentIntents.confirm(
      paymentIntent.id,
      {
        payment_method: 'pm_usBankAccount_' + execution.bankAccountId,
      }
    );

    // 4. Guardar en BD
    await db.insert(transactions).values({
      workflowId: execution.workflowId,
      amount: amount,
      stripePaymentIntentId: confirmed.id,
      status: 'completed',
    });

    return confirmed;
  }

  private calculateAmount(execution: WorkflowExecution): number {
    // Basado en conversiones, clicks, ventas
    const baseAmount = execution.conversions * 2.5;
    const clickBonus = execution.clicks * 0.1;
    const performanceMultiplier = execution.successRate / 100;

    return (baseAmount + clickBonus) * performanceMultiplier;
  }
}
```

---

## 5. RECOPILACIÓN DE DATOS WEB

### 5.1 Estrategia de Scraping

**Antigravity Browser Agent - Targets:**

| Plataforma | Datos a Recopilar | Frecuencia |
|-----------|------------------|-----------|
| **Amazon** | Conversiones, clicks, comisiones | Cada 4 horas |
| **Gumroad** | Ventas, descargas, ingresos | Diariamente |
| **OpenSea** | Ofertas NFT, volumen, royalties | Cada 6 horas |
| **Bandcamp** | Streams, descargas, ingresos | Diariamente |
| **Substack** | Suscriptores, ingresos, tasa de apertura | Semanalmente |

### 5.2 Implementación

```typescript
// server/integrations/webDataCollector.ts
export class WebDataCollector {
  async collectAmazonData() {
    return await antigravityBrowser.navigate({
      url: 'https://affiliate.amazon.com/dashboard',
      selectors: {
        conversions: '.conversion-count',
        clicks: '.click-count',
        earnings: '.earnings-total',
        trackingIds: '.tracking-id-list'
      }
    });
  }

  async collectGumroadData() {
    return await antigravityBrowser.navigate({
      url: 'https://gumroad.com/dashboard',
      selectors: {
        sales: '.sales-count',
        revenue: '.revenue-total',
        products: '.product-list'
      }
    });
  }

  async collectOpenSeaData() {
    return await antigravityBrowser.navigate({
      url: 'https://opensea.io/account',
      selectors: {
        collections: '.collection-item',
        offers: '.offer-card',
        royalties: '.royalty-earnings'
      }
    });
  }

  // Ejecutar todas las recopilaciones en paralelo
  async collectAllData() {
    return await Promise.all([
      this.collectAmazonData(),
      this.collectGumroadData(),
      this.collectOpenSeaData(),
      // ... más plataformas
    ]);
  }
}
```

---

## 6. EJECUCIÓN AUTOMÁTICA DE WORKFLOWS

### 6.1 Triggers Inteligentes

```typescript
// server/integrations/workflowExecutor.ts
export class WorkflowExecutor {
  async executeBasedOnTriggers() {
    // Trigger 1: Datos disponibles
    if (await this.hasNewData()) {
      await this.executeWorkflow('data-processor');
    }

    // Trigger 2: Tiempo programado
    if (this.isScheduledTime('06:00')) {
      await this.executeWorkflow('daily-report');
    }

    // Trigger 3: Umbral de ingresos
    if (await this.getDailyEarnings() > 100) {
      await this.executeWorkflow('payment-processor');
    }

    // Trigger 4: Error detectado
    if (await this.hasErrors()) {
      await this.executeWorkflow('error-recovery');
    }
  }

  async executeWorkflow(workflowId: string) {
    const response = await fetch(
      `http://localhost:5678/api/v1/workflows/${workflowId}/execute`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${N8N_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: await this.prepareWorkflowData(workflowId)
        })
      }
    );

    const execution = await response.json();
    
    // Notificar a Antigravity
    await this.notifyAntigravity({
      event: 'workflow_started',
      workflowId,
      executionId: execution.id
    });

    return execution;
  }
}
```

---

## 7. DASHBOARD DE CONTROL CENTRALIZADO

### 7.1 Vistas Principales

**1. Orquestación en Tiempo Real**
- Estado de todos los agentes de Antigravity
- Workflows activos en n8n
- Transacciones procesadas en Stripe

**2. Recopilación de Datos**
- Últimos datos de cada plataforma
- Timestamp de última sincronización
- Errores de scraping

**3. Ejecuciones de Workflows**
- Historial de ejecuciones
- Tasas de éxito/error
- Ingresos generados

**4. Transacciones**
- Pagos procesados
- Pendientes
- Fallidos

### 7.2 Componente React

```typescript
// client/src/pages/ExpertDashboard.tsx
export function ExpertDashboard() {
  const [orchestration, setOrchestration] = useState(null);
  const [webData, setWebData] = useState(null);
  const [executions, setExecutions] = useState([]);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    // Suscribirse a actualizaciones en tiempo real
    const unsubscribe = trpc.expert.subscribeOrchestration.useSubscription(
      undefined,
      {
        onData: (data) => {
          setOrchestration(data);
          setWebData(data.webData);
          setExecutions(data.executions);
          setTransactions(data.transactions);
        },
      }
    );

    return unsubscribe;
  }, []);

  return (
    <div className="grid grid-cols-4 gap-4">
      <OrchestrationPanel data={orchestration} />
      <WebDataPanel data={webData} />
      <ExecutionsPanel data={executions} />
      <TransactionsPanel data={transactions} />
    </div>
  );
}
```

---

## 8. FLUJO COMPLETO DE EJECUCIÓN

```
1. ANTIGRAVITY INICIA
   ├─ Browser Agent: Navega a plataformas
   ├─ Recopila: Conversiones, clicks, ventas
   └─ Envía datos a n8n

2. N8N PROCESA
   ├─ Webhook recibe datos
   ├─ Workflow: Valida y transforma
   ├─ Calcula ingresos
   └─ Envía evento de completación

3. STRIPE PROCESA PAGO
   ├─ Recibe evento de n8n
   ├─ Crea Payment Intent
   ├─ Confirma con cuenta bancaria
   └─ Registra transacción

4. DASHBOARD ACTUALIZA
   ├─ Muestra ingresos en vivo
   ├─ Registra transacción
   ├─ Notifica al usuario
   └─ Prepara siguiente ejecución

5. CICLO REPITE
   └─ Cada 4-6 horas o por trigger
```

---

## 9. SEGURIDAD Y VALIDACIÓN

### 9.1 Autenticación

```typescript
// Validar tokens en cada petición
const validateN8nToken = (token: string): boolean => {
  try {
    const decoded = jwt.verify(token, process.env.N8N_JWT_SECRET);
    return decoded.aud === 'public-api';
  } catch {
    return false;
  }
};

// Validar Stripe Webhook
const validateStripeWebhook = (payload: string, signature: string): boolean => {
  const hash = crypto
    .createHmac('sha256', process.env.STRIPE_WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');
  return hash === signature;
};
```

### 9.2 Rate Limiting

```typescript
// Limitar ejecuciones concurrentes
const workflowQueue = new PQueue({
  concurrency: 3, // Máximo 3 workflows simultáneos
  interval: 1000,
  intervalCap: 10, // Máximo 10 por segundo
});

await workflowQueue.add(() => executeWorkflow(workflowId));
```

---

## 10. MÉTRICAS Y MONITOREO

### 10.1 KPIs Principales

| Métrica | Objetivo | Frecuencia |
|---------|----------|-----------|
| **Ingresos Diarios** | $100-500 | Tiempo real |
| **Tasa de Éxito** | >95% | Cada ejecución |
| **Tiempo de Ejecución** | <5 min | Cada ejecución |
| **Datos Recopilados** | 100% de plataformas | Cada 4-6 horas |
| **Pagos Procesados** | 100% | Cada transacción |

### 10.2 Alertas

```typescript
// Alertas automáticas
const alerts = {
  lowSuccessRate: async () => {
    if (successRate < 90) {
      await notifyOwner({
        title: 'Tasa de éxito baja',
        content: `Tasa: ${successRate}%`
      });
    }
  },
  
  scrapingError: async () => {
    if (failedScrapes > 2) {
      await notifyOwner({
        title: 'Error en recopilación de datos',
        content: `${failedScrapes} plataformas fallidas`
      });
    }
  },

  paymentFailed: async () => {
    if (failedPayments > 0) {
      await notifyOwner({
        title: 'Pago fallido',
        content: `Revisar transacción`
      });
    }
  }
};
```

---

## 11. PRÓXIMOS PASOS

1. ✅ Documentación de arquitectura (COMPLETADO)
2. ⏳ Implementar integraciones en código
3. ⏳ Configurar webhooks bidireccionales
4. ⏳ Crear tests de integración
5. ⏳ Desplegar en producción

---

**Autor:** Sistema de Automatización Experto  
**Última actualización:** 3 de Diciembre de 2025
