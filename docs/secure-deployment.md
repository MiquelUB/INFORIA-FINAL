# Despliegue Seguro en Producción - INFORIA

## 🎯 Objetivo

Esta guía proporciona instrucciones para desplegar INFORIA de forma segura en producción, asegurando que todas las variables de entorno y configuraciones estén protegidas.

## 🚀 Plataformas de Despliegue Soportadas

### Vercel (Recomendado)
- ✅ Despliegue automático desde Git
- ✅ Variables de entorno seguras
- ✅ SSL automático
- ✅ CDN global
- ✅ Integración con Supabase

### Netlify
- ✅ Despliegue automático desde Git
- ✅ Variables de entorno seguras
- ✅ SSL automático
- ✅ Formularios integrados

### Railway
- ✅ Despliegue full-stack
- ✅ Base de datos incluida
- ✅ Variables de entorno seguras

### Render
- ✅ Despliegue automático
- ✅ SSL automático
- ✅ Variables de entorno seguras

## 🔐 Configuración de Variables de Entorno en Producción

### Variables Requeridas

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | URL de tu proyecto Supabase | `https://tu-proyecto.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Clave anónima de Supabase | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `OPENROUTER_API_KEY` | Clave de API de OpenRouter | `sk-or-v1-...` |

### Variables Opcionales

| Variable | Descripción | Cuándo Usar |
|----------|-------------|-------------|
| `GOOGLE_CLIENT_ID` | ID de cliente de Google OAuth | Si implementas autenticación con Google |
| `GOOGLE_CLIENT_SECRET` | Secreto de cliente de Google OAuth | Si implementas autenticación con Google |
| `VITE_APP_ENV` | Entorno de la aplicación | `production` |
| `VITE_APP_URL` | URL de la aplicación | `https://tu-dominio.com` |

## 🛠️ Configuración por Plataforma

### Vercel

#### 1. Conectar Repositorio
```bash
# Instalar Vercel CLI
npm install -g vercel

# Login en Vercel
vercel login

# Desplegar desde el directorio del proyecto
vercel
```

#### 2. Configurar Variables de Entorno
1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. Ve a **Settings** > **Environment Variables**
3. Añade cada variable:

```bash
# Variables de entorno
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
OPENROUTER_API_KEY=tu-openrouter-key
VITE_APP_ENV=production
VITE_APP_URL=https://tu-dominio.vercel.app
```

#### 3. Configurar Dominio Personalizado
1. Ve a **Settings** > **Domains**
2. Añade tu dominio personalizado
3. Configura los registros DNS según las instrucciones

### Netlify

#### 1. Conectar Repositorio
1. Ve a [Netlify Dashboard](https://app.netlify.com)
2. Haz clic en "New site from Git"
3. Conecta tu repositorio de GitHub/GitLab/Bitbucket

#### 2. Configurar Build Settings
```bash
# Build command
npm run build

# Publish directory
dist

# Node version
18
```

#### 3. Configurar Variables de Entorno
1. Ve a **Site settings** > **Environment variables**
2. Añade cada variable con el mismo formato que Vercel

### Railway

#### 1. Conectar Repositorio
1. Ve a [Railway Dashboard](https://railway.app)
2. Haz clic en "New Project"
3. Selecciona "Deploy from GitHub repo"

#### 2. Configurar Variables de Entorno
1. Ve a **Variables** en tu proyecto
2. Añade las variables de entorno
3. Railway automáticamente las inyecta en el entorno

## 🔒 Configuración de Seguridad

### Supabase en Producción

#### 1. Configurar RLS (Row Level Security)
```sql
-- Verificar que RLS está habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Habilitar RLS si no está habilitado
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
```

#### 2. Configurar Políticas de Seguridad
```sql
-- Política para pacientes
CREATE POLICY "Users can view their own patients" ON public.patients
    FOR SELECT USING (auth.uid() = user_id);

-- Política para informes
CREATE POLICY "Users can view their own reports" ON public.reports
    FOR SELECT USING (auth.uid() = user_id);

-- Política para citas
CREATE POLICY "Users can view their own appointments" ON public.appointments
    FOR SELECT USING (auth.uid() = user_id);
```

#### 3. Configurar CORS
```sql
-- Configurar CORS para tu dominio
INSERT INTO supabase_cors_origins (origin) 
VALUES ('https://tu-dominio.com');
```

### OpenRouter en Producción

#### 1. Configurar Límites de Uso
1. Ve a [OpenRouter Dashboard](https://openrouter.ai/keys)
2. Configura límites de uso para tu API key
3. Monitorea el uso regularmente

#### 2. Configurar Modelos Permitidos
```javascript
// En tu Edge Function
const allowedModels = ['openai/gpt-4o-mini', 'openai/gpt-4o'];
const model = formData.get('model') || 'openai/gpt-4o-mini';

if (!allowedModels.includes(model)) {
  throw new Error('Modelo no permitido');
}
```

### Google OAuth en Producción

#### 1. Configurar URIs de Redirección
1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Ve a **APIs & Services** > **Credentials**
3. Edita tu OAuth 2.0 Client ID
4. Añade las URIs de redirección de producción:
   - `https://tu-dominio.com/auth/callback`
   - `https://tu-dominio.com/auth/signin`

#### 2. Configurar Dominios Autorizados
1. En la misma página de credenciales
2. Añade tu dominio en "Authorized JavaScript origins"
3. Añade tu dominio en "Authorized redirect URIs"

## 📊 Monitoreo y Analytics

### Configurar Analytics

#### Google Analytics
```javascript
// En tu index.html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

#### Sentry para Monitoreo de Errores
```javascript
// En tu main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "tu-sentry-dsn",
  environment: "production",
});
```

### Configurar Logs

#### Vercel
```bash
# Ver logs en tiempo real
vercel logs --follow

# Ver logs de una función específica
vercel logs --function=informe-inteligente
```

#### Netlify
```bash
# Ver logs de build
netlify logs --site=tu-site-id

# Ver logs de funciones
netlify logs --function=informe-inteligente
```

## 🔄 CI/CD Pipeline

### GitHub Actions

#### 1. Crear Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Build
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
          OPENROUTER_API_KEY: ${{ secrets.OPENROUTER_API_KEY }}
          
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

#### 2. Configurar Secrets
1. Ve a tu repositorio en GitHub
2. Ve a **Settings** > **Secrets and variables** > **Actions**
3. Añade los secrets necesarios:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `OPENROUTER_API_KEY`
   - `VERCEL_TOKEN`
   - `ORG_ID`
   - `PROJECT_ID`

## 🧪 Testing de Producción

### Checklist de Despliegue

#### ✅ Antes del Despliegue
- [ ] Variables de entorno configuradas
- [ ] Base de datos migrada
- [ ] Edge Functions desplegadas
- [ ] Dominio configurado
- [ ] SSL habilitado
- [ ] CORS configurado

#### ✅ Después del Despliegue
- [ ] Autenticación funciona
- [ ] Base de datos conecta
- [ ] Generación de informes funciona
- [ ] Google Drive integración funciona
- [ ] Búsqueda universal funciona
- [ ] Centro de ayuda funciona

### Comandos de Verificación

```bash
# Verificar variables de entorno
npm run check-env

# Verificar tipos TypeScript
npm run type-check

# Verificar linting
npm run lint

# Build de producción
npm run build:prod

# Verificar build
npm run preview
```

## 🚨 Troubleshooting de Producción

### Problemas Comunes

#### 1. Error de CORS
**Síntoma**: Error "CORS policy" en el navegador

**Solución**:
1. Verificar configuración de CORS en Supabase
2. Añadir tu dominio a las origenes permitidos
3. Verificar que las variables de entorno son correctas

#### 2. Error de Autenticación
**Síntoma**: Usuarios no pueden iniciar sesión

**Solución**:
1. Verificar configuración de OAuth en producción
2. Verificar URIs de redirección
3. Verificar políticas RLS en Supabase

#### 3. Error de Edge Functions
**Síntoma**: Generación de informes falla

**Solución**:
1. Verificar que las Edge Functions están desplegadas
2. Verificar variables de entorno en Supabase
3. Verificar logs de las funciones

### Comandos de Diagnóstico

```bash
# Verificar estado de Supabase
supabase status

# Ver logs de Edge Functions
supabase functions logs

# Verificar conectividad
curl -I https://tu-proyecto.supabase.co

# Verificar variables de entorno
node -e "console.log(process.env.VITE_SUPABASE_URL)"
```

## 📈 Optimización de Rendimiento

### Configuración de Vite para Producción

```javascript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
```

### Optimización de Imágenes

```javascript
// Usar lazy loading para imágenes
<img src="image.jpg" loading="lazy" alt="Description" />

// Usar formatos modernos
<picture>
  <source srcset="image.webp" type="image/webp" />
  <img src="image.jpg" alt="Description" />
</picture>
```

### Optimización de Bundle

```bash
# Analizar bundle
npm run build
npx vite-bundle-analyzer dist

# Optimizar imports
npm run lint:fix
```

## 🔄 Mantenimiento

### Actualizaciones Regulares

```bash
# Actualizar dependencias
npm update

# Verificar vulnerabilidades
npm audit

# Actualizar Supabase
supabase update

# Aplicar nuevas migraciones
supabase db push
```

### Backup y Recuperación

#### Backup de Base de Datos
```bash
# Crear backup
supabase db dump --data-only > backup.sql

# Restaurar backup
supabase db reset
psql -h localhost -U postgres -d postgres < backup.sql
```

#### Backup de Variables de Entorno
```bash
# Exportar variables (NO incluir en repositorio)
vercel env ls > env-backup.txt
```

---

**¡Despliegue seguro completado! Tu aplicación INFORIA está lista para producción.** 🚀🔒 