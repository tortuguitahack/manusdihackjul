# 3 Sistemas de Ingresos Adicionales - Nivel Ultra Experto

## Sistema 1: Affiliate Marketing Avanzado

### Descripción General
Sistema de comisiones por referral de productos de terceros (Amazon, Gumroad, Stripe, etc.) con tracking automático y análisis de ROI.

### Arquitectura

```
┌─────────────────────────────────────────┐
│  Dashboard de Afiliados                 │
│  - Links únicos de tracking             │
│  - Comisiones en tiempo real            │
│  - Análisis de ROI por campaña          │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  Affiliate Tracking Layer               │
│  - Google Analytics 4 (GA4)             │
│  - UTM parameters automáticos           │
│  - Conversion tracking                  │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  Commission Processing                  │
│  - Stripe Connect para payouts          │
│  - Cálculo automático de comisiones     │
│  - Pago mensual a afiliados             │
└─────────────────────────────────────────┘
```

### Programas de Afiliados Soportados

#### 1. Amazon Associates
- **Comisión:** 3-10% (según categoría)
- **Tracking:** Link de afiliado único
- **Pago:** Mensual (mínimo $100)
- **Integración:** API de Rainforest

```json
{
  "program": "amazon_associates",
  "affiliate_id": "diegoedgard02-20",
  "commission_rate": 0.05,
  "tracking_method": "url_parameter",
  "example_link": "https://www.amazon.com/dp/B0123456789?tag=diegoedgard02-20"
}
```

#### 2. Gumroad Affiliate
- **Comisión:** 30% (compartido con Gumroad)
- **Tracking:** Referral link único
- **Pago:** Automático en Stripe
- **Integración:** Gumroad API

```json
{
  "program": "gumroad_affiliate",
  "affiliate_id": "user_123",
  "commission_rate": 0.30,
  "tracking_method": "referral_link",
  "example_link": "https://gumroad.com/diego?aff=xyz123"
}
```

#### 3. Stripe Referral Partner
- **Comisión:** $500 por cliente referido (pago único)
- **Tracking:** Unique referral code
- **Pago:** Mensual
- **Integración:** Stripe Partner API

```json
{
  "program": "stripe_referral",
  "affiliate_id": "rp_1234567890",
  "commission_per_referral": 500,
  "tracking_method": "referral_code",
  "example_link": "https://stripe.com/referral/diego"
}
```

#### 4. Shutterstock Affiliate
- **Comisión:** 25-30% (según volumen)
- **Tracking:** Affiliate link
- **Pago:** Mensual
- **Integración:** Shutterstock Affiliate API

```json
{
  "program": "shutterstock_affiliate",
  "affiliate_id": "aff_123456",
  "commission_rate": 0.25,
  "tracking_method": "affiliate_link",
  "example_link": "https://www.shutterstock.com?aff=diego"
}
```

### Workflow de Affiliate Marketing (n8n)

```json
{
  "name": "09_Affiliate_Marketing_v2025",
  "nodes": [
    {
      "id": "trigger",
      "name": "Daily Trigger",
      "type": "n8n-nodes-base.cron",
      "parameters": {
        "rule": { "interval": [{ "hours": 24 }] }
      }
    },
    {
      "id": "fetch_commissions",
      "name": "Fetch Commissions",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "https://api.amazon.com/affiliate/commissions",
        "headers": {
          "Authorization": "Bearer {{$env.AMAZON_AFFILIATE_TOKEN}}"
        }
      }
    },
    {
      "id": "calculate_earnings",
      "name": "Calculate Earnings",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "jsCode": "// Calcular comisiones totales\nconst commissions = items.map(item => ({\n  program: item.json.program,\n  amount: item.json.commission_amount,\n  currency: 'USD',\n  timestamp: new Date().toISOString()\n}));\n\nconst total = commissions.reduce((sum, c) => sum + c.amount, 0);\nreturn [{ json: { commissions, total } }];"
      }
    },
    {
      "id": "stripe_payout",
      "name": "Stripe Payout",
      "type": "n8n-nodes-base.stripe",
      "parameters": {
        "operation": "createPayout",
        "amount": "={{$json.total}}",
        "currency": "usd",
        "description": "Affiliate commissions"
      }
    },
    {
      "id": "log_to_dashboard",
      "name": "Log to Dashboard",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "{{$env.WEBHOOK_DASHBOARD_URL}}/api/webhooks/n8n",
        "httpMethod": "POST",
        "body": {
          "workflowId": "09_Affiliate_Marketing",
          "status": "completed",
          "earnings": "={{$json.total}}",
          "timestamp": "={{$now.toISOString()}}",
          "metadata": {
            "commissions": "={{$json.commissions}}"
          }
        }
      }
    }
  ]
}
```

### Ingresos Potenciales
- **Bajo:** $500-$1,000/mes (10-20 referrals/mes)
- **Medio:** $1,000-$2,000/mes (20-40 referrals/mes)
- **Alto:** $2,000-$5,000/mes (40+ referrals/mes)

### KPIs a Monitorear
- Click-through rate (CTR)
- Conversion rate (CR)
- Comisión promedio por referral
- ROI por programa
- Lifetime value (LTV) de cada referral

---

## Sistema 2: API Monetizada

### Descripción General
Vender acceso a los workflows como APIs (generador de imágenes, creador de videos, etc.) con planes de suscripción y metering.

### Arquitectura

```
┌─────────────────────────────────────────┐
│  API Gateway                            │
│  - Rate limiting                        │
│  - Authentication (API keys)            │
│  - Request logging                      │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  Workflow Endpoints                     │
│  - /api/v1/generate-image               │
│  - /api/v1/create-video                 │
│  - /api/v1/generate-audio               │
│  - /api/v1/analyze-market               │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  Metering & Billing                     │
│  - Track requests per API key           │
│  - Stripe billing integration           │
│  - Overage charges                      │
└─────────────────────────────────────────┘
```

### Planes de Suscripción

#### Free Plan
- **Precio:** $0/mes
- **Requests:** 100/mes
- **Rate limit:** 1 request/segundo
- **Endpoints:** Todos (limitados)
- **Support:** Community

```json
{
  "id": "price_api_free",
  "name": "Free",
  "amount": 0,
  "currency": "usd",
  "metadata": {
    "requests_limit": 100,
    "rate_limit": 1,
    "support": "community"
  }
}
```

#### Pro Plan
- **Precio:** $29.99/mes
- **Requests:** 10,000/mes
- **Rate limit:** 10 requests/segundo
- **Endpoints:** Todos
- **Support:** Email
- **Overage:** $0.01 por request adicional

```json
{
  "id": "price_api_pro",
  "name": "Pro",
  "amount": 2999,
  "currency": "usd",
  "recurring": {
    "interval": "month",
    "interval_count": 1
  },
  "metadata": {
    "requests_limit": 10000,
    "rate_limit": 10,
    "support": "email",
    "overage_price": 0.01
  }
}
```

#### Enterprise Plan
- **Precio:** $299.99/mes
- **Requests:** Ilimitado
- **Rate limit:** 100 requests/segundo
- **Endpoints:** Todos + custom
- **Support:** 24/7 dedicado
- **SLA:** 99.9% uptime

```json
{
  "id": "price_api_enterprise",
  "name": "Enterprise",
  "amount": 29999,
  "currency": "usd",
  "recurring": {
    "interval": "month",
    "interval_count": 1
  },
  "metadata": {
    "requests_limit": null,
    "rate_limit": 100,
    "support": "24/7",
    "sla": "99.9%"
  }
}
```

### Endpoints de API

#### 1. Generate Image
```
POST /api/v1/generate-image
Authorization: Bearer sk_live_xxx
Content-Type: application/json

{
  "prompt": "A serene landscape with mountains",
  "model": "stable-diffusion-3-5",
  "size": "1024x1024",
  "quality": "high"
}

Response:
{
  "id": "img_1234567890",
  "url": "https://s3.amazonaws.com/images/img_1234567890.png",
  "created_at": "2025-11-13T22:45:00Z",
  "credits_used": 1
}
```

#### 2. Create Video
```
POST /api/v1/create-video
Authorization: Bearer sk_live_xxx
Content-Type: application/json

{
  "images": ["https://example.com/image1.jpg"],
  "audio": "https://example.com/audio.mp3",
  "template": "vertical_review",
  "resolution": "1080x1920"
}

Response:
{
  "id": "vid_1234567890",
  "url": "https://s3.amazonaws.com/videos/vid_1234567890.mp4",
  "created_at": "2025-11-13T22:45:00Z",
  "credits_used": 5
}
```

#### 3. Generate Audio
```
POST /api/v1/generate-audio
Authorization: Bearer sk_live_xxx
Content-Type: application/json

{
  "prompt": "Cinematic lo-fi loop, 90 bpm, minor key",
  "duration": 30,
  "format": "mp3"
}

Response:
{
  "id": "aud_1234567890",
  "url": "https://s3.amazonaws.com/audio/aud_1234567890.mp3",
  "created_at": "2025-11-13T22:45:00Z",
  "credits_used": 2
}
```

### Implementación en tRPC

```typescript
// server/routers.ts
apiV1: router({
  generateImage: publicProcedure
    .input(z.object({
      prompt: z.string(),
      model: z.string().optional(),
      size: z.string().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      // Validar API key
      const apiKey = ctx.req.headers.authorization?.split(" ")[1];
      const key = await getApiKeyByKey(apiKey);
      
      if (!key || !key.isActive) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      // Verificar límite de requests
      if (key.requestsUsed >= key.requestsLimit) {
        throw new TRPCError({ code: "RESOURCE_EXHAUSTED" });
      }

      // Generar imagen
      const image = await generateImage({ prompt: input.prompt });

      // Incrementar uso
      await incrementApiKeyUsage(key.id);

      // Registrar métrica
      await recordMetric(
        0, // workflowId (0 para API)
        "api_request",
        1,
        { endpoint: "generate-image", apiKeyId: key.id }
      );

      return image;
    })
})
```

### Ingresos Potenciales
- **Bajo:** $500-$1,000/mes (10-20 Pro subscribers)
- **Medio:** $2,000-$5,000/mes (50-100 Pro subscribers)
- **Alto:** $5,000-$10,000/mes (100+ Pro subscribers + Enterprise)

### KPIs a Monitorear
- Número de API keys activas
- Requests por día/mes
- Tasa de uso por plan
- Ingresos por plan
- Churn rate de suscripciones

---

## Sistema 3: Membresía Premium

### Descripción General
Acceso a workflows premium, contenido exclusivo, herramientas avanzadas y comunidad privada.

### Arquitectura

```
┌─────────────────────────────────────────┐
│  Membership Portal                      │
│  - Acceso a workflows premium           │
│  - Contenido exclusivo                  │
│  - Herramientas avanzadas               │
│  - Comunidad privada                    │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  Stripe Subscription Management         │
│  - Billing automático                   │
│  - Renovación automática                │
│  - Cancelación fácil                    │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  Access Control Layer                   │
│  - Role-based access (RBAC)             │
│  - Feature flags por plan               │
│  - Webhook de suscripción               │
└─────────────────────────────────────────┘
```

### Planes de Membresía

#### Basic Membership
- **Precio:** $9.99/mes
- **Acceso a:** 3 workflows premium
- **Contenido:** Tutoriales básicos
- **Comunidad:** Acceso de lectura
- **Support:** Email (48h)

```json
{
  "id": "price_membership_basic",
  "name": "Basic",
  "amount": 999,
  "currency": "usd",
  "recurring": {
    "interval": "month",
    "interval_count": 1
  },
  "metadata": {
    "plan": "basic_membership",
    "workflows_included": 3,
    "support": "email"
  }
}
```

#### Pro Membership
- **Precio:** $29.99/mes
- **Acceso a:** Todos los workflows premium
- **Contenido:** Tutoriales avanzados + webinars
- **Comunidad:** Acceso completo + Discord privado
- **Support:** Email (24h) + chat
- **Bonus:** 1 consultoría gratis/mes

```json
{
  "id": "price_membership_pro",
  "name": "Pro",
  "amount": 2999,
  "currency": "usd",
  "recurring": {
    "interval": "month",
    "interval_count": 1
  },
  "metadata": {
    "plan": "pro_membership",
    "workflows_included": "all",
    "support": "email_and_chat",
    "community": "full_access",
    "bonus": "monthly_consultation"
  }
}
```

#### Elite Membership
- **Precio:** $99.99/mes
- **Acceso a:** Todos los workflows + custom
- **Contenido:** Acceso total + mentoring
- **Comunidad:** Acceso VIP + grupo privado
- **Support:** 24/7 dedicado
- **Bonus:** 4 consultas/mes + prioridad
- **API:** Acceso completo

```json
{
  "id": "price_membership_elite",
  "name": "Elite",
  "amount": 9999,
  "currency": "usd",
  "recurring": {
    "interval": "month",
    "interval_count": 1
  },
  "metadata": {
    "plan": "elite_membership",
    "workflows_included": "all_plus_custom",
    "support": "24/7",
    "community": "vip_access",
    "api_access": true,
    "bonus": "4_consultations_per_month"
  }
}
```

### Workflows Premium Exclusivos

#### 10. Advanced Market Analysis
- Análisis de tendencias de mercado en tiempo real
- Predicción de demanda con ML
- Reporte automático semanal
- **Precio:** Incluido en Pro/Elite

#### 11. Bulk Content Generator
- Generar 100+ contenidos en una ejecución
- Optimización SEO automática
- Distribución a múltiples plataformas
- **Precio:** Incluido en Pro/Elite

#### 12. Advanced DeFi Yield Farming
- Estrategias de yield farming optimizadas
- Rebalanceo automático
- Análisis de riesgo
- **Precio:** Incluido en Elite

### Implementación en Dashboard

```typescript
// Verificar acceso a workflow premium
const canAccessWorkflow = (user: User, workflow: Workflow) => {
  const subscription = await getSubscriptionByUserId(user.id);
  
  if (!subscription || subscription.status !== "active") {
    return false;
  }

  const planAccess = {
    "basic_membership": ["workflow_1", "workflow_2", "workflow_3"],
    "pro_membership": ["all"],
    "elite_membership": ["all", "custom"]
  };

  return planAccess[subscription.plan]?.includes(workflow.id) || false;
};

// Renderizar contenido exclusivo
<PremiumContent plan={subscription.plan}>
  <WorkflowCard workflow={workflow} />
</PremiumContent>
```

### Ingresos Potenciales
- **Bajo:** $1,000-$2,000/mes (100-200 Basic subscribers)
- **Medio:** $3,000-$6,000/mes (100 Basic + 50 Pro)
- **Alto:** $8,000-$15,000/mes (100 Basic + 100 Pro + 20 Elite)

### KPIs a Monitorear
- Número de suscriptores por plan
- Churn rate (cancelaciones)
- Lifetime value (LTV)
- Upgrade rate (Basic → Pro → Elite)
- Engagement rate (uso de workflows)
- NPS (Net Promoter Score)

---

## Resumen de Ingresos Combinados

### Proyección Mensual (Escenario Conservador)

| Sistema | Bajo | Medio | Alto |
| :--- | :--- | :--- | :--- |
| **Workflows Base** | $2,000 | $5,000 | $10,000 |
| **Affiliate Marketing** | $500 | $1,500 | $3,000 |
| **API Monetizada** | $500 | $2,000 | $5,000 |
| **Membresía Premium** | $1,000 | $4,000 | $10,000 |
| **TOTAL** | **$4,000** | **$12,500** | **$28,000** |

### Proyección Anual
- **Bajo:** $48,000/año
- **Medio:** $150,000/año
- **Alto:** $336,000/año

---

## Implementación Timeline

| Fase | Duración | Entregables |
| :--- | :--- | :--- |
| **1. Setup Stripe** | 1 día | Productos, planes, webhooks |
| **2. Affiliate System** | 2 días | Dashboard, tracking, payouts |
| **3. API Monetizada** | 3 días | Endpoints, metering, billing |
| **4. Membresía Premium** | 2 días | Portal, access control, content |
| **5. Testing & Launch** | 2 días | QA, monitoring, launch |

---

**Próximo paso:** Implementar estos sistemas en el Dashboard de Monitoreo.
