import { Loader2, Plus } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useBrands, useCreateBrand } from '@/hooks/useBrands'
import { useCreateModel, useModels } from '@/hooks/useModels'

const NEW_BRAND_VALUE = '__new_brand__'
const NEW_MODEL_VALUE = '__new_model__'

interface BrandModelFieldsProps {
  brandId: string | null
  modelId: string | null
  onBrandChange: (brandId: string | null) => void
  onModelChange: (modelId: string | null) => void
}

export function BrandModelFields({
  brandId,
  modelId,
  onBrandChange,
  onModelChange,
}: BrandModelFieldsProps) {
  const { data: brands = [] } = useBrands()
  const { data: models = [] } = useModels(brandId)
  const createBrand = useCreateBrand()
  const createModel = useCreateModel()

  const [addingBrand, setAddingBrand] = useState(false)
  const [newBrandName, setNewBrandName] = useState('')
  const [addingModel, setAddingModel] = useState(false)
  const [newModelName, setNewModelName] = useState('')

  function handleBrandSelect(value: string) {
    if (value === NEW_BRAND_VALUE) {
      setAddingBrand(true)
      setNewBrandName('')
      return
    }

    setAddingBrand(false)
    const nextBrandId = value === 'none' ? null : value
    onBrandChange(nextBrandId)
    onModelChange(null)
  }

  function handleModelSelect(value: string) {
    if (value === NEW_MODEL_VALUE) {
      setAddingModel(true)
      setNewModelName('')
      return
    }

    setAddingModel(false)
    onModelChange(value === 'none' ? null : value)
  }

  async function handleCreateBrand() {
    const name = newBrandName.trim()
    if (!name) return

    const brand = await createBrand.mutateAsync(name)
    onBrandChange(brand.id)
    onModelChange(null)
    setAddingBrand(false)
    setNewBrandName('')
  }

  async function handleCreateModel() {
    if (!brandId) return
    const name = newModelName.trim()
    if (!name) return

    const model = await createModel.mutateAsync({ brandId, name })
    onModelChange(model.id)
    setAddingModel(false)
    setNewModelName('')
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label>Marca vehículo</Label>
        {addingBrand ? (
          <div className="flex gap-2">
            <Input
              placeholder="Nombre de la marca"
              value={newBrandName}
              onChange={(event) => setNewBrandName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  void handleCreateBrand()
                }
              }}
            />
            <Button
              type="button"
              size="icon"
              variant="outline"
              disabled={!newBrandName.trim() || createBrand.isPending}
              onClick={() => void handleCreateBrand()}
            >
              {createBrand.isPending ? <Loader2 className="animate-spin" /> : <Plus />}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setAddingBrand(false)
                setNewBrandName('')
              }}
            >
              Cancelar
            </Button>
          </div>
        ) : (
          <Select value={brandId ?? 'none'} onValueChange={handleBrandSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar marca" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sin marca</SelectItem>
              {brands.map((brand) => (
                <SelectItem key={brand.id} value={brand.id}>
                  {brand.name}
                </SelectItem>
              ))}
              <SelectItem value={NEW_BRAND_VALUE}>
                <span className="flex items-center gap-1">
                  <Plus className="size-3.5" />
                  Agregar nueva marca...
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="space-y-2">
        <Label>Modelo</Label>
        {addingModel ? (
          <div className="flex gap-2">
            <Input
              placeholder="Nombre del modelo"
              value={newModelName}
              onChange={(event) => setNewModelName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  void handleCreateModel()
                }
              }}
            />
            <Button
              type="button"
              size="icon"
              variant="outline"
              disabled={!newModelName.trim() || createModel.isPending}
              onClick={() => void handleCreateModel()}
            >
              {createModel.isPending ? <Loader2 className="animate-spin" /> : <Plus />}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setAddingModel(false)
                setNewModelName('')
              }}
            >
              Cancelar
            </Button>
          </div>
        ) : (
          <Select
            value={modelId ?? 'none'}
            onValueChange={handleModelSelect}
            disabled={!brandId}
          >
            <SelectTrigger>
              <SelectValue placeholder={brandId ? 'Seleccionar modelo' : 'Elegí una marca primero'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sin modelo</SelectItem>
              {models.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  {model.name}
                </SelectItem>
              ))}
              {brandId ? (
                <SelectItem value={NEW_MODEL_VALUE}>
                  <span className="flex items-center gap-1">
                    <Plus className="size-3.5" />
                    Agregar nuevo modelo...
                  </span>
                </SelectItem>
              ) : null}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  )
}
