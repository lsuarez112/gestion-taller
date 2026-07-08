import { CategoryIcon } from '@/components/categories/CategoryIcon'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  CATEGORY_ICON_GROUPS,
  categoryIconOptions,
  getCategoryIconLabel,
} from '@/lib/category-icons'

const NONE_VALUE = '__none__'

interface CategoryIconSelectProps {
  value: string
  onChange: (value: string) => void
}

export function CategoryIconSelect({ value, onChange }: CategoryIconSelectProps) {
  const selectValue = value || NONE_VALUE
  const selectedLabel = value ? getCategoryIconLabel(value) : null

  return (
    <Select
      value={selectValue}
      onValueChange={(next) => onChange(next === NONE_VALUE ? '' : next)}
    >
      <SelectTrigger className="w-full cursor-pointer">
        <SelectValue placeholder="Seleccionar icono">
          {value ? (
            <span className="flex items-center gap-2">
              <CategoryIcon icon={value} />
              {selectedLabel}
            </span>
          ) : (
            'Sin icono'
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="max-h-72">
        <SelectGroup>
          <SelectLabel>General</SelectLabel>
          <SelectItem value={NONE_VALUE} className="cursor-pointer">
            Sin icono
          </SelectItem>
        </SelectGroup>

        {CATEGORY_ICON_GROUPS.map((group) => (
          <SelectGroup key={group.label}>
            <SelectLabel>{group.label}</SelectLabel>
            {group.icons.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className="cursor-pointer"
              >
                <CategoryIcon icon={option.value} />
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}

        {value && !categoryIconOptions.some((option) => option.value === value) ? (
          <SelectGroup>
            <SelectLabel>Actual</SelectLabel>
            <SelectItem value={value} className="cursor-pointer">
              <CategoryIcon icon={value} />
              {value}
            </SelectItem>
          </SelectGroup>
        ) : null}
      </SelectContent>
    </Select>
  )
}
