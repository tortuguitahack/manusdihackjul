# Configuración de Stripe para el Ecosistema de Automatización

## 1. Productos en Stripe

### Productos Digitales (Tienda)

#### Notion Templates
```json
{
  "id": "prod_notion_templates",
  "name": "Notion Templates",
  "prices": [
    {
      "id": "price_notion_basic",
      "amount": 999,
      "currency": "usd",
      "recurring": null,
      "metadata": {
        "template_type": "budget_tracker",
        "category": "finance"
      }
    }
  ]
}
```

#### Audio Loops
```json
{
  "id": "prod_audio_loops",
  "name": "Audio Loops Pack",
  "prices": [
    {
      "id": "price_audio_5pack",
      "amount": 999,
      "currency": "usd",
      "recurring": null,
      "metadata": {
        "loop_count": 5,
        "category": "music"
      }
    }
  ]
}
```

### Suscripciones

#### API Plans
```json
{
  "id": "prod_api_plans",
  "name": "API Access Plans",
  "prices": [
    {
      "id": "price_api_pro",
      "amount": 2999,
      "currency": "usd",
      "recurring": {
        "interval": "month",
        "interval_count": 1
      },
      "metadata": {
        "plan": "pro",
        "requests_limit": 10000
      }
    },
    {
      "id": "price_api_enterprise",
      "amount": 29999,
      "currency": "usd",
      "recurring": {
        "interval": "month",
        "interval_count": 1
      },
      "metadata": {
        "plan": "enterprise",
        "requests_limit": 999999
      }
    }
  ]
}
```

#### Membership Plans
```json
{
  "id": "prod_membership",
  "name": "Premium Membership",
  "prices": [
    {
      "id": "price_membership_basic",
      "amount": 999,
      "currency": "usd",
      "recurring": {
        "interval": "month",
        "interval_count": 1
      },
      "metadata": {
        "plan": "basic_membership",
        "workflows_included": 3
      }
    },
    {
      "id": "price_membership_pro",
      "amount": 2999,
      "currency": "usd",
      "recurring": {
        "interval": "month",
        "interval_count": 1
      },
      "metadata": {
        "plan": "pro_membership",
        "workflows_included": "all"
      }
    },
    {
      "id": "price_membership_elite",
      "amount": 9999,
      "currency": "usd",
      "recurring": {
        "interval": "month",
        "interval_count": 1
      },
      "metadata": {
        "plan": "elite_membership",
        "workflows_included": "all",
        "api_access": true,
        "support": "24/7"
      }
    }
  ]
}
```

---

## 2. Webhooks de Stripe

### Endpoint de Webhook
```
POST /api/webhooks/stripe
Headers:
  - Content-Type: application/json
  - stripe-signature: <signature>
```

### Eventos a Monitorear

#### payment_intent.succeeded
**Descripción:** Pago completado exitosamente

**Acciones:**
1. Registrar transacción en BD
2. Activar workflow de entrega (ej: enviar Notion template)
3. Actualizar métrica de ingresos
4. Enviar confirmación al usuario

**Payload:**
```json
{
  "type": "payment_intent.succeeded",
  "data": {
    "object": {
      "id": "pi_1234567890",
      "amount": 999,
      "currency": "usd",
      "customer": "cus_1234567890",
      "metadata": {
        "product_id": "prod_notion_templates",
        "user_id": 123
      }
    }
  }
}
```

#### customer.subscription.created
**Descripción:** Nueva suscripción creada

**Acciones:**
1. Crear registro de suscripción en BD
2. Generar API key si es plan "pro" o "enterprise"
3. Activar acceso a workflows premium
4. Enviar bienvenida al usuario

**Payload:**
```json
{
  "type": "customer.subscription.created",
  "data": {
    "object": {
      "id": "sub_1234567890",
      "customer": "cus_1234567890",
      "items": {
        "data": [
          {
            "price": {
              "id": "price_api_pro",
              "product": "prod_api_plans"
            }
          }
        ]
      },
      "current_period_start": 1234567890,
      "current_period_end": 1234567890
    }
  }
}
```

#### customer.subscription.updated
**Descripción:** Suscripción actualizada (cambio de plan)

**Acciones:**
1. Actualizar plan en BD
2. Actualizar límites de API key
3. Notificar cambio al usuario

#### customer.subscription.deleted
**Descripción:** Suscripción cancelada

**Acciones:**
1. Marcar suscripción como cancelada en BD
2. Revocar API keys
3. Desactivar acceso a workflows premium
4. Enviar confirmación de cancelación

#### charge.refunded
**Descripción:** Reembolso procesado

**Acciones:**
1. Registrar reembolso en BD
2. Desactivar acceso a producto/suscripción
3. Revocar API keys si aplica
4. Notificar al usuario

---

## 3. Flujo de Pago (Checkout)

### Frontend (React)
```typescript
import { loadStripe } from "@stripe/js";

const stripe = await loadStripe(process.env.REACT_APP_STRIPE_KEY);

// Crear sesión de checkout
const response = await fetch("/api/create-checkout-session", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    priceId: "price_notion_basic",
    productId: "prod_notion_templates"
  })
});

const { sessionId } = await response.json();

// Redirigir a Stripe Checkout
await stripe.redirectToCheckout({ sessionId });
```

### Backend (tRPC)
```typescript
// Crear sesión de checkout
createCheckoutSession: protectedProcedure
  .input(z.object({
    priceId: z.string(),
    productId: z.string()
  }))
  .mutation(async ({ input, ctx }) => {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: input.priceId,
          quantity: 1
        }
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/checkout/cancel`,
      customer_email: ctx.user.email,
      metadata: {
        userId: ctx.user.id,
        productId: input.productId
      }
    });

    return { sessionId: session.id };
  })
```

---

## 4. Webhook Handler (Node.js/Express)

```typescript
import Stripe from "stripe";
import { createEvent } from "./db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers["stripe-signature"] as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      webhookSecret
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Procesar eventos
  switch (event.type) {
    case "payment_intent.succeeded":
      await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
      break;

    case "customer.subscription.created":
      await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
      break;

    case "customer.subscription.updated":
      await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
      break;

    case "customer.subscription.deleted":
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
      break;

    case "charge.refunded":
      await handleChargeRefunded(event.data.object as Stripe.Charge);
      break;
  }

  res.json({ received: true });
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const userId = paymentIntent.metadata.userId;
  const productId = paymentIntent.metadata.productId;
  const amount = paymentIntent.amount / 100; // Convertir de centavos a dólares

  // Registrar transacción
  await createTransaction({
    userId: parseInt(userId),
    productId,
    amount,
    status: "completed",
    stripePaymentIntentId: paymentIntent.id
  });

  // Activar webhook hacia n8n para entregar producto
  await fetch(`${process.env.WEBHOOK_N8N_URL}/deliver-product`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId,
      productId,
      paymentIntentId: paymentIntent.id
    })
  });

  // Registrar evento
  await createEvent({
    eventType: "payment:completed",
    userId: parseInt(userId),
    data: {
      productId,
      amount,
      paymentIntentId: paymentIntent.id
    }
  });
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.userId;
  const plan = subscription.items.data[0].price.metadata.plan;

  // Crear suscripción en BD
  await createOrUpdateSubscription({
    userId: parseInt(userId),
    plan,
    status: "active",
    stripeSubscriptionId: subscription.id,
    stripeCustomerId: subscription.customer as string,
    currentPeriodStart: new Date(subscription.current_period_start * 1000),
    currentPeriodEnd: new Date(subscription.current_period_end * 1000)
  });

  // Generar API key si es plan de API
  if (plan === "pro" || plan === "enterprise") {
    await createApiKey(parseInt(userId), plan);
  }

  // Registrar evento
  await createEvent({
    eventType: "subscription:created",
    userId: parseInt(userId),
    data: {
      plan,
      subscriptionId: subscription.id
    }
  });
}

// ... Implementar otros handlers ...
```

---

## 5. Variables de Entorno Requeridas

```env
# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# URLs
FRONTEND_URL=https://tu-dominio.com
WEBHOOK_N8N_URL=https://n8n.tu-dominio.com

# Otros
WEBHOOK_SECRET=tu_secreto_webhook
```

---

## 6. Testing de Webhooks

### Usar Stripe CLI para testing local
```bash
# Instalar Stripe CLI
brew install stripe/stripe-cli/stripe

# Escuchar webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Simular evento
stripe trigger payment_intent.succeeded

# Ver eventos
stripe logs tail
```

---

## 7. Flujo de Refund (Reembolso)

```typescript
// Procesar reembolso
const refund = await stripe.refunds.create({
  payment_intent: paymentIntentId,
  reason: "requested_by_customer"
});

// Registrar reembolso en BD
await createTransaction({
  userId,
  amount: -refund.amount / 100, // Negativo para indicar reembolso
  status: "refunded",
  stripePaymentIntentId: paymentIntentId
});

// Desactivar acceso a producto
await updateProductAccess(userId, productId, false);
```

---

## 8. Monitoreo de Pagos

### Dashboard Metrics
- Total de ingresos (por día, mes, año)
- Número de transacciones
- Tasa de conversión
- Valor promedio de transacción
- Suscripciones activas
- Tasa de cancelación

### Alertas
- ⚠️ Fallo de webhook (reintentar automáticamente)
- ⚠️ Refund rate > 5%
- ⚠️ Chargeback detectado
- ⚠️ Ingresos < $100/día

---

## 9. Seguridad

### Mejores Prácticas
- ✅ Nunca exponer claves de Stripe en el frontend
- ✅ Verificar siempre la firma del webhook
- ✅ Usar HTTPS en todos los endpoints
- ✅ Implementar rate limiting
- ✅ Encriptar datos sensibles en BD
- ✅ Usar variables de entorno para credenciales
- ✅ Implementar logging y auditoría

### Validación de Webhook
```typescript
// Siempre verificar la firma
const sig = req.headers["stripe-signature"];
const event = stripe.webhooks.constructEvent(
  req.body,
  sig,
  webhookSecret
);
```

---

## 10. Recursos Útiles

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Stripe Testing](https://stripe.com/docs/testing)
- [Stripe Pricing](https://stripe.com/pricing)

---

**Última actualización:** 2025-11-13
**Versión:** 2025.11.13
