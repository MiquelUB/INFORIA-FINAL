#!/usr/bin/env node

/**
 * Script de Verificación de Configuración - INFORIA
 * 
 * Este script verifica que todas las variables de entorno necesarias
 * estén configuradas correctamente antes de iniciar el proyecto.
 */

const fs = require('fs');
const path = require('path');

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Función para imprimir con colores
function print(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Función para imprimir título
function printTitle(title) {
  print('\n' + '='.repeat(50), 'cyan');
  print(`  ${title}`, 'bright');
  print('='.repeat(50), 'cyan');
}

// Función para imprimir resultado
function printResult(label, status, message = '') {
  const icon = status ? '✅' : '❌';
  const color = status ? 'green' : 'red';
  print(`${icon} ${label}`, color);
  if (message) {
    print(`   ${message}`, 'yellow');
  }
}

// Variables requeridas
const requiredVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'OPENROUTER_API_KEY'
];

// Variables opcionales
const optionalVars = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET'
];

// Función para cargar variables de entorno
function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env.local');
  
  if (!fs.existsSync(envPath)) {
    return null;
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};

  envContent.split('\n').forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...valueParts] = trimmedLine.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').replace(/^["']|["']$/g, '');
        envVars[key.trim()] = value;
      }
    }
  });

  return envVars;
}

// Función para validar formato de URL
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// Función para validar formato de API key
function isValidApiKey(key) {
  return key && key.length > 20;
}

// Función principal de verificación
function checkEnvironment() {
  printTitle('VERIFICACIÓN DE CONFIGURACIÓN - INFORIA');
  
  // Verificar que existe el archivo .env.local
  const envPath = path.join(process.cwd(), '.env.local');
  const envExists = fs.existsSync(envPath);
  
  printResult('Archivo .env.local', envExists, 
    envExists ? 'Archivo encontrado' : 'Archivo no encontrado. Ejecuta: cp env.example .env.local');
  
  if (!envExists) {
    print('\n❌ No se puede continuar sin el archivo .env.local', 'red');
    print('💡 Ejecuta: cp env.example .env.local', 'yellow');
    process.exit(1);
  }

  // Cargar variables de entorno
  const envVars = loadEnvFile();
  
  if (!envVars) {
    print('\n❌ Error al cargar el archivo .env.local', 'red');
    process.exit(1);
  }

  print('\n📋 VERIFICANDO VARIABLES REQUERIDAS:', 'blue');
  
  let allRequiredVarsValid = true;
  
  // Verificar variables requeridas
  requiredVars.forEach(varName => {
    const value = envVars[varName];
    const exists = !!value;
    
    let isValid = false;
    let message = '';
    
    if (exists) {
      switch (varName) {
        case 'VITE_SUPABASE_URL':
          isValid = isValidUrl(value);
          message = isValid ? 'URL válida' : 'Formato de URL inválido';
          break;
        case 'VITE_SUPABASE_ANON_KEY':
          isValid = isValidApiKey(value);
          message = isValid ? 'Clave válida' : 'Formato de clave inválido';
          break;
        case 'OPENROUTER_API_KEY':
          isValid = isValidApiKey(value);
          message = isValid ? 'Clave válida' : 'Formato de clave inválido';
          break;
        default:
          isValid = true;
          message = 'Configurada';
      }
    } else {
      message = 'No configurada';
    }
    
    printResult(varName, exists && isValid, message);
    
    if (!exists || !isValid) {
      allRequiredVarsValid = false;
    }
  });

  print('\n📋 VERIFICANDO VARIABLES OPCIONALES:', 'blue');
  
  // Verificar variables opcionales
  optionalVars.forEach(varName => {
    const value = envVars[varName];
    const exists = !!value;
    
    if (exists) {
      const isValid = isValidApiKey(value);
      const message = isValid ? 'Configurada correctamente' : 'Formato inválido';
      printResult(varName, isValid, message);
    } else {
      printResult(varName, true, 'No configurada (opcional)');
    }
  });

  // Verificar estructura del proyecto
  print('\n📁 VERIFICANDO ESTRUCTURA DEL PROYECTO:', 'blue');
  
  const requiredFiles = [
    'package.json',
    'vite.config.ts',
    'src/integrations/supabase/client.ts',
    'supabase/functions/informe-inteligente/index.ts'
  ];
  
  let allFilesExist = true;
  
  requiredFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    const exists = fs.existsSync(filePath);
    printResult(file, exists, exists ? 'Archivo encontrado' : 'Archivo no encontrado');
    if (!exists) allFilesExist = false;
  });

  // Resumen final
  printTitle('RESUMEN DE VERIFICACIÓN');
  
  if (allRequiredVarsValid && allFilesExist) {
    print('🎉 ¡Configuración completada exitosamente!', 'green');
    print('💡 Puedes iniciar el proyecto con: npm run dev', 'cyan');
  } else {
    print('❌ Hay problemas en la configuración que deben resolverse', 'red');
    print('💡 Revisa los errores anteriores y vuelve a ejecutar este script', 'yellow');
    process.exit(1);
  }

  // Información adicional
  print('\n📚 RECURSOS ÚTILES:', 'blue');
  print('• Documentación: docs/environment-setup.md', 'cyan');
  print('• Supabase Dashboard: https://supabase.com/dashboard', 'cyan');
  print('• OpenRouter Keys: https://openrouter.ai/keys', 'cyan');
  print('• Google Cloud Console: https://console.cloud.google.com', 'cyan');
  
  print('\n🔒 NOTAS DE SEGURIDAD:', 'yellow');
  print('• Nunca subas .env.local al repositorio', 'yellow');
  print('• Usa diferentes claves para desarrollo y producción', 'yellow');
  print('• Rota las claves regularmente', 'yellow');
}

// Ejecutar verificación
if (require.main === module) {
  try {
    checkEnvironment();
  } catch (error) {
    print(`\n❌ Error durante la verificación: ${error.message}`, 'red');
    process.exit(1);
  }
}

module.exports = { checkEnvironment }; 