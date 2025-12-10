# Ecosistema de Automatización - Workflows n8n & Make

**Versión:** 2025.11.13  
**Autor:** Diego (Expert Level)  
**Nivel:** Ultra Avanzado - Nivel Experto

---

## 📋 Tabla de Contenidos

1. [Descripción General](#descripción-general)
2. [Workflows Incluidos](#workflows-incluidos)
3. [Requisitos Previos](#requisitos-previos)
4. [Instalación](#instalación)
5. [Configuración de Credenciales](#configuración-de-credenciales)
6. [Variables de Entorno](#variables-de-entorno)
7. [Integración con Dashboard](#integración-con-dashboard)
8. [Monitoreo y Alertas](#monitoreo-y-alertas)
9. [Troubleshooting](#troubleshooting)

---

## 🎯 Descripción General

Este ecosistema automatiza **8 workflows de monetización** que generan ingresos pasivos a través de:

- **Creación de contenido:** Videos, imágenes, audio, texto
- **Venta de productos digitales:** Plantillas, loops, NFTs
- **Plataformas de monetización:** Amazon, Shutterstock, Gumroad, Bandcamp, OpenSea
- **Finanzas descentralizadas:** Yield farming automático
- **Ingresos adicionales:** Affiliate marketing, API monetizada, membresía premium

### Arquitectura Master/Slave

```
┌─────────────────────────────────────────┐
│  00_Master_Orchestrator                 │
│  - Controla ejecución de workflows      │
│  - Límite: 40 ejecuciones/día           │
│  - Batches de 3 workflows               │
└─────────────────────────────────────────┘
         ↓ (Webhooks)
┌─────────────────────────────────────────┐
│  Workflows Slave (01-08)                │
│  - Ejecutan en paralelo                 │
│  - Reportan a Dashboard                 │
│  - Registran métricas en BD             │
└─────────────────────────────────────────┘
```

---

## 📦 Workflows Incluidos

| ID | Nombre | Frecuencia | Ingresos | Plataforma |
| :--- | :--- | :--- | :--- | :--- |
| **00** | Master Orchestrator | Cada 6h | Control | n8n |
| **01** | Amazon Influencer Shorts | Cada 4h | $0.80-$4.50 | n8n |
| **02** | Stock AI Photos | Cada 6h | $0.35-$0.60 | n8n |
| **03** | Notion Templates + Gumroad | Cada 12h | $5-$15/venta | n8n |
| **04** | Redbubble Bulk Design | Cada 8h | $0.50-$2.00/venta | n8n |
| **05** | NFT Base Chain | Diario | $5-$50/venta | n8n |
| **06** | Audio Loops Bandcamp | Cada 12h | $2-$10/venta | n8n |
| **07** | Newsletter Substack | Semanal | $10-$100/suscripción | n8n |
| **08** | DeFi Yield Farming | Cada 4h | $5-$50/día | n8n |

### Proyección de Ingresos

- **Escenario Conservador:** $4,000-$5,000/mes
- **Escenario Realista:** $12,500/mes
- **Escenario Optimista:** $28,000+/mes

---

## ⚙️ Requisitos Previos

### Software
- **n8n** (versión 1.0+) - [Descargar](https://n8n.io)
- **Make** (opcional) - [Descargar](https://make.com)
- **Node.js** 18+ (para ejecutar localmente)
- **Git** (para versionado)

### Cuentas Requeridas
- ✅ Google Cloud (Google Sheets, Google Drive)
- ✅ OpenAI (GPT-4o para generación de contenido)
- ✅ Stability AI (Stable Diffusion 3.5 para imágenes)
- ✅ ElevenLabs (TTS y generación de audio)
- ✅ Amazon Influencer (para videos)
- ✅ Shutterstock (para imágenes de stock)
- ✅ Gumroad (para venta de plantillas)
- ✅ Bandcamp (para venta de audio)
- ✅ OpenSea (para NFTs)
- ✅ Stripe (para pagos)
- ✅ Aave & Curve (para DeFi)
- ✅ Notion (para plantillas)

### Presupuesto Inicial
- **Créditos API:** $50-$100/mes
- **Stripe:** 2.9% + $0.30 por transacción
- **Hosting n8n:** $0-$100/mes (según plan)

---

## 🚀 Instalación

### Opción 1: n8n Cloud (Recomendado)

```bash
# 1. Ir a https://n8n.cloud
# 2. Crear cuenta
# 3. Crear workspace
# 4. Importar workflows JSON
```

### Opción 2: n8n Self-Hosted

```bash
# 1. Instalar n8n
npm install -g n8n

# 2. Iniciar servidor
n8n start

# 3. Acceder a http://localhost:5678
# 4. Importar workflows JSON desde la UI
```

### Opción 3: Docker

```bash
# 1. Clonar repositorio
git clone https://github.com/tu-usuario/ecosistema-monitoreo.git
cd ecosistema-monitoreo

# 2. Levantar con Docker Compose
docker-compose up -d

# 3. Acceder a http://localhost:5678
```

### Importar Workflows

```bash
# Método 1: UI de n8n
# 1. Ir a "Workflows" → "Import"
# 2. Seleccionar archivo JSON
# 3. Hacer clic en "Import"

# Método 2: CLI de n8n
n8n import:workflow --input workflows/n8n/00_Master_Orchestrator_v2025.json
n8n import:workflow --input workflows/n8n/01_AMZ_Influencer_Shorts_v2025.json
# ... repetir para todos los workflows
```

---

## 🔐 Configuración de Credenciales

### 1. Google Sheets

```bash
# 1. Ir a Google Cloud Console
# 2. Crear proyecto "Ecosistema Monitoreo"
# 3. Habilitar APIs:
#    - Google Sheets API
#    - Google Drive API
# 4. Crear credenciales (OAuth 2.0)
# 5. Descargar JSON
# 6. En n8n: Credentials → Google Sheets → Pegar JSON
```

### 2. OpenAI

```bash
# 1. Ir a https://platform.openai.com/account/api-keys
# 2. Crear API key
# 3. En n8n: Credentials → OpenAI → Pegar API key
```

### 3. Stability AI

```bash
# 1. Ir a https://platform.stability.ai/account/keys
# 2. Crear API key
# 3. En n8n: Credentials → Stability AI → Pegar API key
```

### 4. ElevenLabs

```bash
# 1. Ir a https://elevenlabs.io/app/settings/api-keys
# 2. Copiar API key
# 3. En n8n: Credentials → ElevenLabs → Pegar API key
```

### 5. Amazon Influencer

```bash
# 1. Registrarse en Amazon Influencer
# 2. Obtener credenciales de API
# 3. En n8n: Credentials → Amazon Influencer → Pegar credenciales
```

### 6. Shutterstock

```bash
# 1. Registrarse como contributor en Shutterstock
# 2. Obtener API credentials
# 3. En n8n: Credentials → Shutterstock → Pegar credenciales
```

### 7. Gumroad

```bash
# 1. Ir a https://gumroad.com/settings/api
# 2. Copiar API token
# 3. En n8n: Credentials → Gumroad → Pegar token
```

### 8. Bandcamp

```bash
# 1. Registrarse como artista en Bandcamp
# 2. Obtener API credentials
# 3. En n8n: Credentials → Bandcamp → Pegar credenciales
```

### 9. OpenSea

```bash
# 1. Ir a https://opensea.io/account/settings
# 2. Generar API key
# 3. En n8n: Credentials → OpenSea → Pegar API key
```

### 10. Stripe

```bash
# 1. Ir a https://dashboard.stripe.com/apikeys
# 2. Copiar Secret Key
# 3. En n8n: Credentials → Stripe → Pegar Secret Key
```

### 11. Aave & Curve

```bash
# 1. Generar API keys en plataformas
# 2. En n8n: Credentials → Aave → Pegar API key
# 3. En n8n: Credentials → Curve → Pegar API key
```

### 12. Notion

```bash
# 1. Ir a https://www.notion.so/my-integrations
# 2. Crear integración
# 3. Copiar token
# 4. En n8n: Credentials → Notion → Pegar token
```

---

## 🔑 Variables de Entorno

Crear archivo `.env` en la raíz del proyecto:

```env
# Google
GOOGLE_SHEET_ID=1a2b3c4d5e6f7g8h9i0j
GOOGLE_DRIVE_FOLDER_ID=folder_id_here

# APIs
OPENAI_API_KEY=sk-...
STABILITY_API_KEY=sk-...
ELEVENLABS_API_KEY=...
AAVE_API_KEY=...

# Plataformas
AMAZON_AFFILIATE_ID=diegoedgard02-20
SHUTTERSTOCK_API_KEY=...
GUMROAD_API_TOKEN=...
BANDCAMP_API_TOKEN=...
OPENSEA_API_KEY=...
OPENSEA_CONTRACT_ADDRESS=0x...

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# DeFi
DEPOSIT_AMOUNT=1000
WALLET_ADDRESS=0x...
WALLET_PRIVATE_KEY=...

# Dashboard
WEBHOOK_DASHBOARD_URL=https://dashboard.tu-dominio.com
WEBHOOK_SECRET=tu_secreto_super_seguro

# Notion
NOTION_TEMPLATE_ID=page_id_here

# Timezone
TIMEZONE=America/La_Paz
```

---

## 🔗 Integración con Dashboard

### Webhook Endpoint

Todos los workflows envían datos al dashboard mediante:

```
POST /api/webhooks/n8n
Headers:
  - Content-Type: application/json
  - Authorization: Bearer {WEBHOOK_SECRET}

Body:
{
  "workflowId": "01_AMZ_Influencer",
  "status": "completed|failed",
  "earnings": 2.50,
  "timestamp": "2025-11-13T22:45:00Z",
  "metadata": {
    "asin": "B0123456789",
    "videoUrl": "https://...",
    "title": "Product Review"
  }
}
```

### Registrar Webhook en n8n

```bash
# En cada workflow, agregar nodo "HTTP Request":
# URL: {{$env.WEBHOOK_DASHBOARD_URL}}/api/webhooks/n8n
# Method: POST
# Headers:
#   Content-Type: application/json
#   Authorization: Bearer {{$env.WEBHOOK_SECRET}}
# Body: (ver arriba)
```

---

## 📊 Monitoreo y Alertas

### Métricas Clave

- **Ejecuciones por día:** Máximo 40 (controlado por Master)
- **Tasa de éxito:** Objetivo >95%
- **Ingresos diarios:** Suma de todas las transacciones
- **Tiempo promedio de ejecución:** <5 minutos por workflow

### Alertas Automáticas

El dashboard genera alertas si:
- ⚠️ Tasa de error > 5%
- ⚠️ Ingresos < $100/día
- ⚠️ Webhook no responde
- ⚠️ API quota agotada
- ⚠️ Suscripción de Stripe vencida

### Dashboard en Tiempo Real

Acceder a: `https://dashboard.tu-dominio.com`

Visualizar:
- 📈 Gráfico de ingresos (últimas 24h, 7d, 30d)
- 🔄 Estado de workflows (running, idle, failed)
- 💰 Ingresos por workflow
- 📊 Métricas de ejecución
- 🎯 Proyecciones de ingresos

---

## 🛠️ Troubleshooting

### Problema: "Credenciales inválidas"

**Solución:**
1. Verificar que las API keys sean correctas
2. Verificar que las APIs estén habilitadas en las plataformas
3. Verificar que no haya expirado el token
4. Regenerar credenciales si es necesario

### Problema: "Webhook no responde"

**Solución:**
1. Verificar que el dashboard esté ejecutándose
2. Verificar que `WEBHOOK_DASHBOARD_URL` sea correcto
3. Verificar que `WEBHOOK_SECRET` coincida
4. Revisar logs del dashboard

### Problema: "Límite de API alcanzado"

**Solución:**
1. Aumentar el intervalo de ejecución de workflows
2. Reducir el número de workflows simultáneos
3. Actualizar plan de API (pagar por más cuota)
4. Implementar caching para reducir llamadas

### Problema: "Workflow se ejecuta pero no genera ingresos"

**Solución:**
1. Verificar que las plataformas estén funcionando
2. Verificar que los productos estén publicados
3. Revisar logs de n8n para errores específicos
4. Probar workflow manualmente

### Problema: "Dashboard no muestra datos"

**Solución:**
1. Verificar que los webhooks se estén enviando
2. Verificar que la base de datos esté conectada
3. Verificar que los registros se estén insertando en BD
4. Revisar logs del servidor

---

## 📈 Optimización y Escalado

### Fase 1: Optimización (Mes 1)
- Ajustar frecuencias de ejecución
- Optimizar prompts de IA
- Mejorar tasa de conversión

### Fase 2: Escalado (Mes 2-3)
- Agregar más workflows
- Aumentar volumen de contenido
- Expandir a nuevas plataformas

### Fase 3: Automatización Avanzada (Mes 4+)
- Implementar ML para predicción de demanda
- Crear sistema de rebalanceo automático
- Integrar más fuentes de ingresos

---

## 📚 Recursos Útiles

- [n8n Documentation](https://docs.n8n.io)
- [Make Documentation](https://www.make.com/en/help)
- [Stripe API Reference](https://stripe.com/docs/api)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [Google Sheets API](https://developers.google.com/sheets/api)

---

## 📞 Soporte

Para problemas o preguntas:
1. Revisar logs en n8n
2. Consultar documentación de APIs
3. Verificar variables de entorno
4. Contactar con soporte de plataformas

---

## 📄 Licencia

Este ecosistema es de uso privado. No se permite redistribución sin autorización.

---

**Última actualización:** 2025-11-13  
**Versión:** 2025.11.13  
**Estado:** ✅ Producción
