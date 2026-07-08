const authErrorMap: Record<string, string> = {
  'Invalid login credentials': 'Email o contraseña incorrectos',
  'Email not confirmed': 'El email no está confirmado',
  'User not found': 'Usuario no encontrado',
  'Invalid email or password': 'Email o contraseña incorrectos',
  'Too many requests': 'Demasiados intentos. Probá de nuevo más tarde',
  'Network request failed': 'Error de conexión. Verificá tu internet',
  'User already registered': 'Ya existe una cuenta con ese email',
  'Password should be at least 6 characters':
    'La contraseña debe tener al menos 6 caracteres',
  'Signup requires a valid password': 'Ingresá una contraseña válida',
  'Unable to validate email address: invalid format': 'El formato del email no es válido',
}

const supabaseErrorMap: Record<string, string> = {
  'duplicate key value violates unique constraint "inventory_units_sku_key"':
    'Ya existe una unidad con ese SKU',
  'duplicate key value violates unique constraint "brands_name_key"':
    'Ya existe una marca con ese nombre',
  'duplicate key value violates unique constraint "models_brand_id_name_key"':
    'Ya existe un modelo con ese nombre para esta marca',
  'new row violates row-level security policy':
    'No tenés permisos para realizar esta acción',
  'JWT expired': 'Tu sesión expiró. Volvé a ingresar',
}

function findPartialMatch(message: string, map: Record<string, string>): string | null {
  const exact = map[message]
  if (exact) return exact

  for (const [key, value] of Object.entries(map)) {
    if (message.includes(key)) return value
  }

  return null
}

export function translateAuthError(message: string): string {
  return (
    findPartialMatch(message, authErrorMap) ??
    'No se pudo completar la operación. Verificá tus datos'
  )
}

export function translateSupabaseError(message: string): string {
  return (
    findPartialMatch(message, supabaseErrorMap) ??
    'Ocurrió un error. Intentá de nuevo'
  )
}

export const toastMessages = {
  product: {
    created: 'Artículo creado correctamente',
    updated: 'Artículo actualizado',
    deleted: 'Artículo eliminado',
    createError: 'No se pudo crear el artículo',
    updateError: 'No se pudo actualizar el artículo',
    deleteError: 'No se pudo eliminar el artículo',
    imageUploaded: 'Imagen subida',
    imageDeleted: 'Imagen eliminada',
    imagesDeleted: 'Todas las imágenes fueron eliminadas',
    imageDeleteError: 'No se pudo eliminar la imagen',
    imageUploadError: 'No se pudo subir la imagen',
    imageLimit: 'Máximo 2 imágenes por artículo',
  },
  unit: {
    added: 'Unidad agregada',
    updated: 'Unidad actualizada',
    sold: 'Unidad marcada como vendida',
    retired: 'Unidad dada de baja',
    addError: 'No se pudo agregar la unidad',
    updateError: 'No se pudo actualizar la unidad',
    sellError: 'No se pudo registrar la venta',
    retireError: 'No se pudo dar de baja la unidad',
    skuRequired: 'El SKU es obligatorio',
  },
  auth: {
    signedOut: 'Sesión cerrada',
  },
  category: {
    created: 'Categoría creada correctamente',
    updated: 'Categoría actualizada',
    deleted: 'Categoría eliminada',
    createError: 'No se pudo crear la categoría',
    updateError: 'No se pudo actualizar la categoría',
    deleteError: 'No se pudo eliminar la categoría',
    deleteHasProducts: 'No se puede eliminar: hay artículos en esta categoría',
  },
  brand: {
    created: 'Marca creada correctamente',
    updated: 'Marca actualizada',
    deleted: 'Marca eliminada',
    createError: 'No se pudo crear la marca',
    updateError: 'No se pudo actualizar la marca',
    deleteError: 'No se pudo eliminar la marca',
    deleteHasModels: 'No se puede eliminar: hay modelos asociados',
    deleteHasProducts: 'No se puede eliminar: hay artículos con esta marca',
  },
  model: {
    created: 'Modelo creado correctamente',
    updated: 'Modelo actualizado',
    deleted: 'Modelo eliminado',
    createError: 'No se pudo crear el modelo',
    updateError: 'No se pudo actualizar el modelo',
    deleteError: 'No se pudo eliminar el modelo',
    deleteHasProducts: 'No se puede eliminar: hay artículos con este modelo',
  },
} as const
