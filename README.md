# Guida Contable SaaS - Frontend

Frontend moderno para el sistema de gestión contable Guida Contable SaaS, construido con React, TypeScript y Vite.

## 🚀 Características

- **Modern Stack**: React 18 + TypeScript + Vite
- **Diseño Moderno**: Tailwind CSS + Lucide React icons
- **Gestión de Estado**: React Query + React Hook Form
- **Autenticación**: JWT con rutas protegidas
- **Comunicación**: Axios con interceptors
- **Routing**: React Router DOM v6
- **Validación**: Zod + React Hook Form

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── Auth/           # Componentes de autenticación
│   ├── Clientes/       # Componentes de gestión de clientes
│   └── Layout/         # Componentes de layout (Sidebar, Header)
├── hooks/              # Custom hooks
├── lib/                # Utilidades y configuración
├── pages/              # Páginas principales
├── providers/          # Proveedores de contexto
├── types/              # Definiciones de TypeScript
└── App.tsx             # Componente principal
```

## 🎨 Módulos Implementados

### 1. **Dashboard**
- Estadísticas generales
- Gráficos de ingresos
- Actividad reciente
- Acciones rápidas

### 2. **Gestión de Clientes**
- CRUD completo de clientes
- Validación de CUIT/DNI
- Filtros y búsqueda
- Estados (Activo/Inactivo)

### 3. **Facturación**
- Listado de facturas
- Emisión de facturas
- Estados (Pendiente/Pagada/Anulada)
- Integración AFIP

### 4. **Generador de PDF**
- Facturas PDF
- Presupuestos
- Reportes personalizados
- Plantillas configurables

### 5. **Auditoría**
- Registro completo de acciones
- Filtros por usuario/acción/entidad
- Exportación de logs
- Timeline interactivo

### 6. **Configuración**
- Datos de empresa
- Configuración de facturación
- Seguridad y permisos
- Integraciones (AFIP)

## 🔧 Configuración

### Requisitos
- Node.js 18+ y npm
- API Backend corriendo (puerto 8080)

### Instalación
```bash
# Clonar repositorio
git clone <repo-url>
cd contable-frontend

# Instalar dependencias
npm install

# Variables de entorno
cp .env.local .env

# Ejecutar en desarrollo
npm run dev
```

### Variables de Entorno
```env
VITE_API_URL=http://localhost:8080
VITE_APP_NAME=Guida Contable SaaS
VITE_ENABLE_AFIP_INTEGRATION=true
```

### Scripts Disponibles
```bash
npm run dev          # Desarrollo con Hot Reload
npm run build        # Build para producción
npm run preview      # Preview build
npm run lint         # Linter
```

## 🛠 Tecnologías Utilizadas

### Core
- **React 18**: Biblioteca UI
- **TypeScript**: Tipado estático
- **Vite**: Bundler y dev server
- **Tailwind CSS**: Framework CSS

### Estado y Datos
- **React Query**: Cache y sincronización
- **React Hook Form**: Manejo de formularios
- **Zod**: Validación de esquemas

### UI y UX
- **Lucide React**: Iconos
- **React Router DOM**: Navegación
- **Axios**: Cliente HTTP

## 🔌 Integración con Backend

### Endpoints Consumidos
```
/auth/login           # Autenticación
/auth/register        # Registro
/clientes/*           # Gestión de clientes
/facturas/*           # Facturación
/pdf/*                # Generación PDF
/audit/*              # Auditoría
/afip/*               # Integración AFIP
```

### Configuración API
```typescript
// src/lib/api.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Interceptores automáticos para:
// - Inserción de token JWT
// - Manejo de errores 401 (redirect a login)
// - Content-Type application/json
```

## 🚀 Despliegue

### Build de Producción
```bash
npm run build
```

### Estructura del Build
```
dist/
├── assets/           # Archivos estáticos optimizados
├── index.html        # Entry point
└── ...               # Bundles JS/CSS
```

### Recomendaciones de Hosting
- **Vercel**: Para React/SPA
- **Netlify**: Static hosting
- **AWS S3 + CloudFront**: Para alta escalabilidad

## 📱 Responsive Design

El frontend es completamente responsive con breakpoints:
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px  
- **Desktop**: > 1024px

## 🔐 Seguridad

### Características
- Rutas protegidas con JWT
- Tokens almacenados en localStorage (considerar httpOnly cookies para producción)
- Re-autenticación automática en refresh
- Logout automático en error 401

### Mejoras Recomendadas para Producción
- Implementar refresh tokens
- Usar httpOnly cookies para tokens
- Añadir rate limiting
- Implementar CSRF protection

## 📈 Performance

### Optimizaciones Incluidas
- Code splitting automático (Vite)
- Bundle splitting
- Lazy loading de rutas
- Cache con React Query

### Métricas Objetivo
- FCP (First Contentful Paint): < 1.5s
- LCP (Largest Contentful Paint): < 2.5s
- CLS (Cumulative Layout Shift): < 0.1
- TBT (Total Blocking Time): < 200ms

## 🐛 Debugging

### Herramientas
- React DevTools
- React Query DevTools
- Browser DevTools

### Logs
```typescript
// Configuración de niveles
VITE_LOG_LEVEL=debug  # debug, info, warn, error
```

## 🤝 Contribución

1. Fork el proyecto
2. Crear feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push branch (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Propietario - Guida Pixel © 2024

## 📞 Soporte

Para soporte, abrir un issue en el repositorio o contactar al equipo de desarrollo.