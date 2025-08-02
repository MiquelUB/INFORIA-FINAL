# Guía de Pruebas: Integración "Generar Informe con IA"

## Objetivo
Validar que un usuario puede generar un informe a partir de una transcripción y/o notas, y recibir una respuesta correcta de la IA.

## Preparación del Entorno

### 1. Verificar Variables de Entorno
Asegúrate de que las siguientes variables estén configuradas:

```bash
# En tu archivo .env o en las variables de entorno de Supabase
OPENROUTER_API_KEY=tu_api_key_de_openrouter
SUPABASE_URL=https://pwhyrqjmzhkuguvfkrkc.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. Iniciar Servicios
```bash
# Terminal 1: Servidor de desarrollo
cd voz_25-7-25-main
npm run dev

# Terminal 2: Supabase Functions (opcional para desarrollo local)
npx supabase functions serve
```

### 3. Verificar Estado de Servicios
- Frontend: http://localhost:5173
- Supabase Functions: http://localhost:54321/functions/v1

## Ejecución de la Prueba

### Paso 1: Navegación a SessionWorkspace
1. Abre http://localhost:5173 en tu navegador
2. Navega a la página SessionWorkspace
3. Verifica que la interfaz se carga correctamente

### Paso 2: Simulación de Grabación
1. Haz clic en "Empezar Grabación"
2. Espera unos segundos
3. Haz clic en "Parar"
4. Verifica que aparece la transcripción simulada

### Paso 3: Introducción de Datos
1. **Transcripción** (automática después de la grabación):
   ```
   El paciente expresó sentimientos de ansiedad durante la sesión. 
   Mencionó dificultades en el trabajo y problemas de sueño. 
   El terapeuta sugirió técnicas de relajación y estableció 
   objetivos para la próxima sesión.
   ```

2. **Notas Adicionales** (introducir manualmente):
   ```
   El paciente mostró signos de ansiedad generalizada. 
   Se observó inquietud motora y dificultad para concentrarse. 
   Se acordó implementar técnicas de respiración diafragmática 
   y establecer una rutina de sueño regular.
   ```

### Paso 4: Generación del Informe
1. Haz clic en "Generar Informe con IA"
2. Observa el feedback visual:
   - El botón cambia a "Generando..."
   - Se deshabilita durante el proceso
   - Aparece un toast de "Generando informe..."

### Paso 5: Verificación de Resultados

#### A. Feedback Visual
- ✅ El botón se deshabilita y muestra "Generando..."
- ✅ Aparece toast de confirmación
- ✅ El botón vuelve a su estado normal

#### B. Llamada de Red (Herramientas de Desarrollador)
1. Abre las herramientas de desarrollador (F12)
2. Ve a la pestaña "Network"
3. Filtra por "informe-inteligente"
4. Verifica:
   - ✅ Método: POST
   - ✅ Status: 200 OK
   - ✅ Request payload contiene transcription y sessionNotes
   - ✅ Response contiene { report: "..." }

#### C. Logs del Backend
1. En el dashboard de Supabase:
   - Ve a Functions > Logs
   - Busca la función "informe-inteligente"
   - Verifica que no hay errores

#### D. Respuesta Final
1. En la consola del navegador:
   - Abre la pestaña "Console"
   - Busca el log: "Generated Report: ..."
   - Verifica que el informe tiene formato Markdown

## Criterios de Éxito

### ✅ Funcionalidad Básica
- [ ] La página se carga sin errores
- [ ] La simulación de grabación funciona
- [ ] Los campos de transcripción y notas se llenan correctamente
- [ ] El botón "Generar Informe con IA" está habilitado

### ✅ Integración con IA
- [ ] La petición POST se envía correctamente
- [ ] La Edge Function responde con status 200
- [ ] Se recibe un informe en formato Markdown
- [ ] No hay errores en los logs del backend

### ✅ Experiencia de Usuario
- [ ] Feedback visual durante la carga
- [ ] Toast de confirmación al completar
- [ ] Manejo de errores apropiado
- [ ] Interfaz responsiva

## Solución de Problemas

### Error: "Usuario no autenticado"
- Verifica que estás logueado en la aplicación
- Revisa las variables de entorno de Supabase

### Error: "OPENROUTER_API_KEY is not set"
- Verifica que la variable de entorno esté configurada
- Reinicia el servidor de desarrollo

### Error: "Function not found"
- Verifica que la función esté desplegada en Supabase
- O ejecuta `npx supabase functions serve` para desarrollo local

### Error: "Network Error"
- Verifica la conectividad a internet
- Revisa que OpenRouter esté disponible

## Datos de Prueba

### Transcripción de Ejemplo
```
El paciente expresó sentimientos de ansiedad durante la sesión. 
Mencionó dificultades en el trabajo y problemas de sueño. 
El terapeuta sugirió técnicas de relajación y estableció 
objetivos para la próxima sesión.
```

### Notas de Sesión de Ejemplo
```
El paciente mostró signos de ansiedad generalizada. 
Se observó inquietud motora y dificultad para concentrarse. 
Se acordó implementar técnicas de respiración diafragmática 
y establecer una rutina de sueño regular.
```

## Resultado Esperado

El sistema debería generar un informe estructurado en formato Markdown que incluya:

1. **Datos de la sesión**
2. **Motivo de consulta**
3. **Resumen y análisis**
4. **Resultados de pruebas** (si aplica)
5. **Análisis evolutivo**
6. **Hipótesis y líneas de trabajo**
7. **Plan de acción**

El informe debe ser profesional, técnico y basado únicamente en la información proporcionada. 