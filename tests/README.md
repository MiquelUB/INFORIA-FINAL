# Tests

Aquesta carpeta conté tots els tests del projecte iNFORiA.

## Estructura

```
tests/
├── README.md              # Aquest fitxer
├── test-integration.js    # Tests d'integració per a la generació d'informes amb IA
└── (futurs tests...)
```

## Tipus de Tests

### Tests d'Integració
- **test-integration.js**: Valida la integració completa del flux "Generar Informe amb IA"
  - Testa les Edge Functions de Supabase
  - Valida la integració del frontend
  - Comprova l'entorn de desenvolupament

## Execució

Per executar els tests d'integració:

```bash
# Des de l'arrel del projecte
node tests/test-integration.js
```

## Requisits

- Servidor de desenvolupament en execució (Vite)
- Supabase Functions disponibles
- Connexió a Internet per a les crides a l'API

## Futurs Tests

- Tests unitaris per a components React
- Tests d'integració per a autenticació
- Tests E2E per a fluxos complets
- Tests de rendiment 