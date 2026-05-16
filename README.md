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
│   ├── Auth/           # Login, registro, rutas protegidas
│   ├── Clientes/       # Formulario modal de cliente
│   └── Layout/         # Sidebar, Header, Layout principal
├── hooks/              # Custom hooks (useAuth)
├── lib/                # Utilidades y configuración
│   └── api.ts          # Cliente Axios + endpoints de todos los servicios
├── pages/              # Páginas principales
│   ├── Dashboard.tsx
│   ├── Clientes.tsx
│   ├── Facturas.tsx
│   ├── CuentaCorriente.tsx
│   ├── HonorariosRecurrentes.tsx
│   ├── Empleados.tsx
│   ├── MisDocumentos.tsx
│   ├── MiCuenta.tsx
│   ├── PDFGenerator.tsx
│   ├── Auditoria.tsx
│   ├── Configuracion.tsx
│   └── AdminPanel.tsx
├── providers/          # Proveedores de contexto (React Query)
├── types/              # Definiciones TypeScript (User, Cliente, Factura, etc.)
└── App.tsx             # Routing principal con guards por rol
```

## 🎨 Módulos Implementados

### 1. **Dashboard**
- Estadísticas generales (clientes, facturación, movimientos)
- Actividad reciente desde API
- Acciones rápidas con navegación

### 2. **Gestión de Clientes**
- CRUD completo de clientes
- Validación de CUIT
- Filtros y búsqueda
- Estados (Activo/Inactivo)
- Sincronización automática de honorarios recurrentes

### 3. **Facturación**
- Listado de facturas con filtros por estado
- Creación de facturas con items dinámicos
- Emisión oficial en AFIP (Factura A/B/C)
- Cálculo automático de IVA 21% para Factura A
- Campos AFIP completos: tipo comprobante, punto de venta, concepto, fechas de servicio, importes (IVA, tributos, exentas, no gravado)
- Estados: Borrador / Emitida AFIP / Pagada / Anulada
- Anulación de borradores

### 4. **Cuenta Corriente**
- Selector de cliente con búsqueda
- Balance y saldo en tiempo real
- Movimientos con filtros (cargos, pagos, honorarios)
- Registro de pagos manuales
- Generación de cargos manuales
- Links de pago MercadoPago
- Exportación a PDF y Excel

### 5. **Honorarios Recurrentes**
- Configuración de honorario mensual por cliente
- Gestión de overrides (ajustes por mes)
- Generación masiva de honorarios del mes
- Prevención de duplicados

### 6. **Empleados (STAFF)**
- Listado de empleados del estudio
- Creación con generación de password temporal
- Permisos granulares por empleado (clientes, facturas, documentos, dashboard)

### 7. **Documentos**
- Subida de archivos con categorías (PDF, imágenes, Excel, Word)
- Descarga directa
- Eliminación
- Filtro por categoría

### 8. **Mi Cuenta (Clientes)**
- Vista exclusiva para clientes (rol CLIENT)
- Balance y movimientos propios
- Descarga de facturas en PDF
- Links de pago MercadoPago

### 9. **Generador de PDF**
- Generación de facturas PDF
- Presupuestos
- Reportes personalizados

### 10. **Auditoría**
- Registro de acciones del sistema
- Filtros por usuario, acción y entidad
- Paginación real
- Estadísticas (hoy, usuarios activos, acciones críticas)

### 11. **Configuración**
- Datos de la empresa (razón social, CUIT, email)
- Defaults de facturación (punto de venta, IVA, moneda)
- Preferencias de notificaciones
- Enlaces a configuración AFIP y MercadoPago

### 12. **Administración SaaS (Super Admin)**
- Panel exclusivo para SUPER_ADMIN
- CRUD de estudios (tenants)
- Configuración AFIP por tenant (certificado .p12, CUIT, password, homologación)
- Configuración MercadoPago por tenant
- Gestión de módulos por tenant
- Estadísticas globales de la plataforma

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
/api/v1/auth/login              # Autenticación JWT
/api/v1/auth/me                 # Perfil del usuario
/api/v1/clients/*               # Gestión de clientes
/api/v1/invoices/*              # Facturación (crear, listar, emitir AFIP, anular)
/api/v1/ledger/*                # Cuenta corriente, balance, pagos, honorarios
/api/v1/fees/*                  # Honorarios recurrentes
/api/v1/documents/*             # Gestión de documentos
/api/v1/dashboard/*             # Estadísticas
/api/v1/audit/*                 # Auditoría
/api/afip/*                     # Integración AFIP (test-token, ultimo-comprobante, emitir)
/api/v1/tenants/*               # Gestión de empleados y permisos STAFF
/api/v1/tenants/me              # Configuración del tenant actual
/api/v1/admin/*                 # Administración SaaS (SUPER_ADMIN)
/api/v1/reports/*               # Reportes PDF/Excel
/api/v1/pdf/*                   # Generación de documentos PDF
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