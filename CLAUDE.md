# Inventario de Repuestos - Taller Mecánico

## Descripción
App de gestión de inventario de piezas/repuestos de vehículos para un taller de reparación de autos. Permite gestionar stock, registrar ventas con precio, y manejar múltiples unidades por producto con SKU individual. Todo detrás de autenticación.

## Stack
- **Frontend:** React 18+ con Vite, TypeScript
- **UI:** shadcn/ui + Tailwind CSS (mobile-first, uso principal desde celular en el taller)
- **Backend/DB:** Supabase (PostgreSQL + Auth + Storage)
- **State:** React Query (TanStack Query) para cache y sync con Supabase
- **Imágenes:** Compresión client-side antes de subir (browser-image-compression), max 800px ancho, JPEG quality 75

## Estructura de Base de Datos (ya creada en Supabase)

### Tablas
- `profiles` — extiende auth.users (id UUID PK → auth.users, full_name, role: 'admin'|'viewer')
- `categories` — categorías de piezas (id, name, icon, sort_order). Precargadas: Motor, Suspensión, Frenos, Carrocería, Eléctrico, Transmisión, Escape, Interior, Refrigeración, Otros
- `products` — definición del artículo (id, name, description, category_id FK, vehicle_brand, vehicle_model, vehicle_year_range, reference_price, created_by FK, timestamps)
- `product_images` — fotos del producto 1-2 max (id, product_id FK cascade, storage_path, sort_order)
- `inventory_units` — cada pieza física con SKU único (id, product_id FK cascade, sku UNIQUE, status: 'disponible'|'vendido'|'baja', cost_price, sale_price, sold_at, notes, created_by FK, timestamps)

### Vista
- `product_stock_summary` — resumen por producto con units_available, units_sold, units_retired, total_sold_value

### Seguridad
- RLS habilitado en todas las tablas
- Función `is_admin()` para verificar rol
- Todo requiere autenticación, solo admin puede escribir, todos leen
- Storage bucket `product-images` (5MB max, JPEG/PNG/WebP, solo admin sube/borra)

## Módulos del Frontend

### 1. Auth
- Login con email/password (Supabase Auth)
- Sin registro público, usuarios se crean desde Supabase dashboard
- Redirect a login si no autenticado

### 2. Catálogo / Browse (Home)
- Grilla de cards con thumbnail, nombre, categoría, badge con cantidad disponible
- Filtros: categoría (chips/select), búsqueda por texto (nombre producto)
- Ordenar por: nombre, fecha, stock disponible
- Mobile-first: cards apiladas en una columna

### 3. Detalle de Producto (Modal o página)
- Galería de fotos (swipe en mobile)
- Info del producto: nombre, descripción, categoría, vehículo compatible
- Tabla de unidades: SKU, estado (badge color), precio costo, precio venta, fecha venta, notas
- Acciones admin: agregar unidad, marcar como vendida (pide precio venta), dar de baja, editar producto, eliminar producto

### 4. Alta/Edición de Producto
- Form con campos del producto
- Upload de fotos desde cámara/galería (max 2)
- Alta de unidades iniciales con SKU y precio costo

### 5. Dashboard Simple
- Cards con: total productos, unidades disponibles, unidades vendidas, valor total vendido
- Últimos movimientos (últimas 10 ventas/bajas)

## Convenciones de Código

### Estructura de carpetas
```
src/
  components/
    ui/          # shadcn components
    layout/      # Header, Sidebar, Layout
    products/    # ProductCard, ProductDetail, ProductForm
    inventory/   # UnitRow, UnitForm, SellDialog
    dashboard/   # StatCard, RecentActivity
  hooks/         # useProducts, useInventory, useAuth, useCategories
  lib/
    supabase.ts  # cliente supabase
    utils.ts     # helpers
    types.ts     # tipos TypeScript
  pages/         # si se usa router, sino todo en App
```

### Reglas
- TypeScript estricto, no `any`
- Nombres de componentes en PascalCase, hooks en camelCase con prefijo `use`
- Queries a Supabase siempre a través de custom hooks con TanStack Query
- Manejo de errores con toast (sonner via shadcn)
- Formularios con react-hook-form + zod para validación
- Idioma de la UI: español
- Comentarios en código: español

## Variables de Entorno
```
VITE_SUPABASE_URL = https://zhfokejnnsscuqfhituc.supabase.co/rest/v1/
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoZm9rZWpubnNzY3VxZmhpdHVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3NjQzNjYsImV4cCI6MjA5ODM0MDM2Nn0.66y-eTNgAXkLJbJf2I4oom3rLSCt29NSp-N4VkEiqXI
```

## Usuarios
- 2 usuarios iniciales (ambos admin), creados desde Supabase dashboard
- Primer usuario registrado es admin automáticamente (trigger en DB)
- Escalable a más usuarios con rol viewer