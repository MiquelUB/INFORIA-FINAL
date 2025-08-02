# Estructura del Projecte iNFORiA

Aquest document descriu l'arquitectura i organització del projecte iNFORiA, una aplicació SaaS per a psicòlegs emprendedors.

## 📁 Estructura General

```
INFORIA-NUEVO/
├── src/                    # Codi principal de l'aplicació
│   ├── app/               # Punt d'entrada de l'aplicació
│   ├── components/        # Components visuals purs
│   ├── containers/        # Contenidors amb estat i lògica
│   ├── pages/            # Pàgines de l'aplicació
│   ├── services/         # Serveis i APIs
│   ├── hooks/            # Hooks personalitzats
│   ├── lib/              # Llibreries i utilitats
│   ├── types/            # Definició de tipus globals
│   ├── styles/           # Estils i CSS
│   ├── assets/           # Recursos estàtics
│   ├── config/           # Configuracions
│   ├── api/              # APIs i integracions
│   ├── integrations/     # Integracions externes
│   ├── utils/            # Utilitats generals
│   └── vite-env.d.ts     # Tipus de Vite
├── tests/                # Tests del projecte
├── docs/                 # Documentació
├── scripts/              # Scripts de desenvolupament
├── supabase/             # Configuració de Supabase
└── (fitxers de configuració)
```

## 🏗️ Arquitectura per Capes

### 1. **Components (`src/components/`)**
**Responsabilitat**: Components visuals purs sense estat

```typescript
// Exemple: Header.tsx
export const Header = () => {
  return <header>...</header>;
};
```

**Característiques**:
- Components visuals purs
- Sense estat intern
- Reutilitzables
- Props simples
- No depenen d'APIs externes

**Contingut**:
- `ui/` - Components de shadcn/ui
- `Header.tsx` - Capçalera de l'aplicació
- `DayFocus.tsx` - Component de focus diari
- `ReportModule.tsx` - Mòdul de reports
- `SearchModule.tsx` - Mòdul de cerca
- `DashboardHeader.tsx` - Capçalera del dashboard
- `NavigationHeader.tsx` - Navegació
- `VideoPlayerModal.tsx` - Modal de reproductor de vídeo

### 2. **Containers (`src/containers/`)**
**Responsabilitat**: Components amb estat i lògica de negoci

```typescript
// Exemple: MainDashboard.tsx
const MainDashboard = () => {
  const [state, setState] = useState();
  // Lògica de negoci aquí
  return <div>...</div>;
};
```

**Característiques**:
- Gestionen estat
- Contenen lògica de negoci
- Componen múltiples components
- Interactuen amb serveis
- Poden tenir efectes secundaris

**Contingut**:
- `MainDashboard.tsx` - Layout principal amb composició
- `Dashboard.tsx` - Layout alternatiu
- `CalendarModule.tsx` - Mòdul amb estat de calendari
- `UniversalSearch.tsx` - Cerca amb estat
- `NewAppointmentModal.tsx` - Modal amb estat de formulari
- `ReportDisplayModal.tsx` - Modal amb estat de visualització

### 3. **Services (`src/services/`)**
**Responsabilitat**: Lògica de negoci i comunicació amb APIs

```typescript
// Exemple: googleAuth.ts
export const signInWithGoogle = async (): Promise<GoogleUser> => {
  // Implementació de l'autenticació
};
```

**Característiques**:
- Funcions asíncrones
- Comunicació amb APIs externes
- Lògica de negoci centralitzada
- Gestió d'errors
- Transformació de dades

**Contingut**:
- `googleAuth.ts` - Autenticació amb Google
- `reportGenerator.ts` - Generació d'informes amb IA
- `reportApi.ts` - API de reports
- `appointmentApi.ts` - API de cites
- `searchApi.ts` - API de cerca
- `supportApi.ts` - API de suport
- `subscriptionApi.ts` - API de subscripcions

### 4. **Hooks (`src/hooks/`)**
**Responsabilitat**: Lògica reutilitzable i gestió d'estat

```typescript
// Exemple: useSession.ts
export const useSession = (): UseSessionReturn => {
  const [session, setSession] = useState();
  // Lògica de sessió
  return { session, signIn, signOut };
};
```

**Característiques**:
- Lògica reutilitzable
- Gestió d'estat compartit
- Abstracció de complexitat
- Integració amb serveis
- Efectes secundaris controlats

**Contingut**:
- `useSession.ts` - Gestió d'estat de sessió
- `use-toast.ts` - Notificacions toast
- `use-mobile.tsx` - Detecció de dispositiu mòbil

### 5. **Lib (`src/lib/`)**
**Responsabilitat**: Utilitats i funcions auxiliars

```typescript
// Exemple: parseSession.ts
export const parseSessionData = (data: SessionData): ParsedSession => {
  // Transformació i validació de dades
};
```

**Característiques**:
- Funcions pures
- Transformació de dades
- Validació
- Formatatge
- Càlculs

**Contingut**:
- `parseSession.ts` - Processament de sessions
- `utils.ts` - Utilitats generals

### 6. **Types (`src/types/`)**
**Responsabilitat**: Definició de tipus globals

```typescript
// Exemple: types/index.ts
export interface User {
  id: string;
  email: string;
  name: string;
  // ...
}
```

**Característiques**:
- Tipus compartits
- Interfícies d'API
- Tipus d'estat
- Enums i unions
- Tipus utilitaris

**Contingut**:
- `index.ts` - Tipus globals (User, Session, Patient, Report, etc.)

### 7. **Pages (`src/pages/`)**
**Responsabilitat**: Pàgines de l'aplicació

```typescript
// Exemple: Index.tsx
const Index = () => {
  return <MainDashboard />;
};
```

**Característiques**:
- Components de nivell de pàgina
- Routing
- Layout específic
- Integració de contenidors

**Contingut**:
- `Index.tsx` - Pàgina principal
- `Login.tsx` - Pàgina d'inici de sessió
- `PatientList.tsx` - Llista de pacients
- `SessionWorkspace.tsx` - Espai de treball de sessió
- `CalendarView.tsx` - Vista de calendari
- `MyAccount.tsx` - Compte d'usuari
- `FAQs.tsx` - Preguntes freqüents
- `HelpCenter.tsx` - Centre d'ajuda
- `NotFound.tsx` - Pàgina 404

## 🎯 Separació de Responsabilitats

### **Principi de Responsabilitat Única**
- **Components**: Només presentació visual
- **Containers**: Lògica de negoci i estat
- **Services**: Comunicació amb APIs i lògica de negoci
- **Hooks**: Lògica reutilitzable
- **Lib**: Utilitats i transformacions
- **Types**: Definició de tipus

### **Flux de Dades**
```
Pages → Containers → Services → APIs
   ↓         ↓         ↓
Components ← Hooks ← Lib
```

### **Patró Container/Component**
```typescript
// Container (amb estat)
const UserDashboard = () => {
  const { users, loading } = useUsers();
  return <UserList users={users} loading={loading} />;
};

// Component (visual pur)
const UserList = ({ users, loading }) => {
  return <div>{users.map(user => <UserCard user={user} />)}</div>;
};
```

## 🚀 Recomanacions per a Futurs Desenvolupaments

### 1. **Tests**
```typescript
// Estructura recomanada
tests/
├── unit/           # Tests unitaris
├── integration/    # Tests d'integració
├── e2e/           # Tests end-to-end
└── fixtures/      # Dades de test
```

### 2. **Lògica de Domini**
```typescript
// Estructura recomanada
src/
├── domain/         # Lògica de domini
│   ├── entities/   # Entitats de negoci
│   ├── usecases/   # Casos d'ús
│   └── repositories/ # Repositoris
```

### 3. **Persistència**
```typescript
// Estructura recomanada
src/
├── data/           # Capa de dades
│   ├── repositories/ # Implementació de repositoris
│   ├── datasources/  # Fonts de dades
│   └── mappers/     # Mapejadors de dades
```

### 4. **Configuració**
```typescript
// Estructura recomanada
src/
├── config/         # Configuracions
│   ├── environment.ts
│   ├── constants.ts
│   └── routes.ts
```

## 📋 Millores Futures

### **Curta Termini**
- [ ] Afegir tests unitaris per a components
- [ ] Implementar tests d'integració per a serveis
- [ ] Afegir validació de tipus més estricta

### **Mitjà Termini**
- [ ] Implementar lògica de domini
- [ ] Afegir capa de persistència
- [ ] Implementar gestió d'estat global (Zustand/Redux)

### **Llarg Termini**
- [ ] Microfrontends per a mòduls específics
- [ ] Arquitectura de microserveis
- [ ] Implementació de PWA

## 🔧 Configuració Actual

### **Vite**
- Alias `@` apunta a `src/`
- Configuració de TypeScript optimitzada
- Hot Module Replacement activat

### **TypeScript**
- Configuració estricta
- Path mapping configurat
- Tipus globals definits

### **Tailwind CSS**
- Configuració personalitzada
- Components de shadcn/ui integrats
- Sistema de design tokens

## 📚 Documentació Relacionada

- [README.md](./README.md) - Documentació general del projecte
- [tests/README.md](./tests/README.md) - Documentació dels tests
- [docs/](./docs/) - Documentació específica per mòduls

---

**Última actualització**: Agost 2025
**Versió**: 1.0.0
**Arquitectura**: Container/Component Pattern amb separació de responsabilitats 