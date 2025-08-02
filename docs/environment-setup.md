# Configuración Segura del Entorno - INFORIA

## 🎯 Objetivo

Esta guía proporciona instrucciones paso a paso para configurar de forma segura el entorno de desarrollo de INFORIA, asegurando que las claves de API y variables sensibles estén protegidas.

## 📋 Prerrequisitos

### Software Requerido
- **Node.js 18+**: [Descargar aquí](https://nodejs.org/)
- **npm**: Viene incluido con Node.js
- **Git**: [Descargar aquí](https://git-scm.com/)
- **Supabase CLI**: `npm install -g supabase`

### Cuentas de Servicios
- **Supabase**: [Crear cuenta](https://supabase.com)
- **OpenRouter**: [Crear cuenta](https://openrouter.ai)
- **Google Cloud Platform**: [Crear cuenta](https://console.cloud.google.com) (opcional)

## 🔧 Configuración Paso a Paso

### 1. Clonar el Repositorio

```bash
# Clonar el repositorio
git clone <URL_DEL_REPOSITORIO>
cd voz_25-7-25-main

# Verificar que estás en la rama correcta
git status
```

### 2. Instalar Dependencias

```bash
# Instalar dependencias del proyecto
npm install

# Verificar que la instalación fue exitosa
npm run build
```

### 3. Configurar Variables de Entorno

#### Paso 1: Crear Archivo de Entorno

```bash
# Copiar el archivo de ejemplo
cp env.example .env.local

# Verificar que el archivo se creó correctamente
ls -la .env.local
```

#### Paso 2: Obtener Claves de Supabase

1. **Acceder a Supabase Dashboard**
   - Ve a [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Inicia sesión con tu cuenta

2. **Crear un Nuevo Proyecto**
   - Haz clic en "New Project"
   - Elige tu organización
   - Dale un nombre al proyecto (ej: "inforia-dev")
   - Establece una contraseña para la base de datos
   - Selecciona una región cercana
   - Haz clic en "Create new project"

3. **Obtener las Claves de API**
   - En el dashboard del proyecto, ve a **Settings** > **API**
   - Copia la **Project URL**
   - Copia la **anon public** key

4. **Configurar en .env.local**
   ```bash
   VITE_SUPABASE_URL="https://tu-proyecto.supabase.co"
   VITE_SUPABASE_ANON_KEY="tu-anon-key"
   ```

#### Paso 3: Obtener Clave de OpenRouter

1. **Acceder a OpenRouter**
   - Ve a [https://openrouter.ai/keys](https://openrouter.ai/keys)
   - Inicia sesión con tu cuenta

2. **Crear Nueva API Key**
   - Haz clic en "Create Key"
   - Dale un nombre descriptivo (ej: "INFORIA Development")
   - Selecciona los modelos que necesitas (GPT-4o-mini)
   - Copia la clave generada

3. **Configurar en .env.local**
   ```bash
   OPENROUTER_API_KEY="tu-openrouter-key"
   ```

#### Paso 4: Configurar Google OAuth (Opcional)

1. **Acceder a Google Cloud Console**
   - Ve a [https://console.cloud.google.com](https://console.cloud.google.com)
   - Crea un nuevo proyecto o selecciona uno existente

2. **Habilitar APIs**
   - Ve a **APIs & Services** > **Library**
   - Busca y habilita "Google+ API"
   - Busca y habilita "Google Drive API"

3. **Crear Credenciales OAuth**
   - Ve a **APIs & Services** > **Credentials**
   - Haz clic en "Create Credentials" > "OAuth 2.0 Client IDs"
   - Configura las URIs de redirección:
     - `http://localhost:5173/auth/callback`
     - `http://localhost:3000/auth/callback`

4. **Configurar en .env.local**
   ```bash
   GOOGLE_CLIENT_ID="tu-google-client-id"
   GOOGLE_CLIENT_SECRET="tu-google-client-secret"
   ```

### 4. Configurar Supabase Localmente

#### Paso 1: Inicializar Supabase

```bash
# Inicializar Supabase en el proyecto
supabase init

# Verificar la configuración
supabase status
```

#### Paso 2: Iniciar Supabase Local

```bash
# Iniciar Supabase localmente
supabase start

# Verificar que todos los servicios estén corriendo
supabase status
```

#### Paso 3: Aplicar Migraciones

```bash
# Aplicar todas las migraciones
supabase db push

# Verificar que las tablas se crearon
supabase db reset
```

### 5. Verificar la Configuración

#### Paso 1: Verificar Variables de Entorno

```bash
# Verificar que el archivo .env.local existe
ls -la .env.local

# Verificar que las variables están configuradas
grep -E "VITE_SUPABASE_URL|VITE_SUPABASE_ANON_KEY|OPENROUTER_API_KEY" .env.local
```

#### Paso 2: Probar la Conexión

```bash
# Iniciar el servidor de desarrollo
npm run dev

# Verificar que no hay errores en la consola
# El proyecto debería estar disponible en http://localhost:5173
```

#### Paso 3: Verificar Funcionalidades

1. **Autenticación**: Probar login/logout
2. **Base de Datos**: Verificar que las tablas están creadas
3. **Edge Functions**: Probar generación de informes
4. **Google Drive**: Probar guardado de informes (si está configurado)

## 🔐 Seguridad y Mejores Prácticas

### Protección de Variables de Entorno

#### ✅ Lo que SÍ debes hacer:
- Usar `.env.local` para desarrollo local
- Configurar variables en el servidor de producción
- Usar diferentes claves para desarrollo y producción
- Rotar claves regularmente
- Usar claves con permisos mínimos necesarios

#### ❌ Lo que NO debes hacer:
- Subir archivos `.env.local` al repositorio
- Compartir claves de API en chats o emails
- Usar claves de producción en desarrollo
- Hardcodear claves en el código fuente
- Usar claves con permisos excesivos

### Estructura de Archivos Segura

```
voz_25-7-25-main/
├── .env.local              # Variables locales (NO subir)
├── env.example             # Plantilla de variables (SÍ subir)
├── .gitignore              # Protege archivos sensibles
└── docs/
    └── environment-setup.md # Esta documentación
```

### Verificación de Seguridad

```bash
# Verificar que .env.local está en .gitignore
grep ".env.local" .gitignore

# Verificar que no hay claves hardcodeadas
grep -r "sk-" src/
grep -r "eyJ" src/

# Verificar que no hay archivos .env en el repositorio
find . -name ".env*" -type f
```

## 🚨 Troubleshooting

### Problemas Comunes

#### 1. Variables de Entorno No Se Cargan

**Síntoma**: `process.env.VITE_SUPABASE_URL` es undefined

**Solución**:
```bash
# Verificar que el archivo existe
ls -la .env.local

# Reiniciar el servidor de desarrollo
npm run dev

# Verificar que las variables están correctas
cat .env.local
```

#### 2. Error de Conexión a Supabase

**Síntoma**: Error "Invalid API key" o "Connection failed"

**Solución**:
1. Verificar que la URL y anon key son correctas
2. Verificar que el proyecto de Supabase está activo
3. Verificar que las políticas RLS están configuradas

#### 3. Error de OpenRouter API

**Síntoma**: Error "Invalid API key" en generación de informes

**Solución**:
1. Verificar que la clave de OpenRouter es válida
2. Verificar que tienes créditos disponibles
3. Verificar que el modelo seleccionado está disponible

#### 4. Error de Google OAuth

**Síntoma**: Error "Invalid client" en autenticación

**Solución**:
1. Verificar que las credenciales OAuth son correctas
2. Verificar que las URIs de redirección están configuradas
3. Verificar que las APIs están habilitadas

### Comandos de Diagnóstico

```bash
# Verificar estado de Supabase
supabase status

# Verificar logs de Supabase
supabase logs

# Verificar variables de entorno
node -e "console.log(process.env.VITE_SUPABASE_URL)"

# Verificar conectividad
curl -I https://tu-proyecto.supabase.co
```

## 📚 Recursos Adicionales

### Documentación Oficial
- [Supabase Documentation](https://supabase.com/docs)
- [OpenRouter API Documentation](https://openrouter.ai/docs)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

### Herramientas Útiles
- [Supabase CLI](https://supabase.com/docs/reference/cli)
- [OpenRouter Dashboard](https://openrouter.ai/keys)
- [Google Cloud Console](https://console.cloud.google.com)

### Comunidad y Soporte
- [Supabase Discord](https://discord.supabase.com)
- [OpenRouter Discord](https://discord.gg/openrouter)
- [GitHub Issues](https://github.com/tu-usuario/inforia/issues)

## 🔄 Mantenimiento

### Actualización Regular

```bash
# Actualizar dependencias
npm update

# Actualizar Supabase CLI
npm install -g supabase@latest

# Actualizar migraciones
supabase db push

# Verificar seguridad
npm audit
```

### Rotación de Claves

1. **Crear nuevas claves** en los dashboards correspondientes
2. **Actualizar variables** en `.env.local` y producción
3. **Probar funcionalidades** con las nuevas claves
4. **Revocar claves antiguas** después de confirmar que todo funciona

### Monitoreo

- Revisar logs de Supabase regularmente
- Monitorear uso de OpenRouter API
- Verificar que las políticas de seguridad están activas
- Revisar accesos y permisos periódicamente

---

**¡Configuración completada! Tu entorno de desarrollo de INFORIA está listo para usar de forma segura.** 🔒✨ 