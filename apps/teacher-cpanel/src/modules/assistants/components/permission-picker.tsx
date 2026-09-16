import { CheckCheck, ShieldCheck, Square } from 'lucide-react'
import { Badge, Button, Card, CheckboxGroup, CheckboxTile } from '@teachedo/ui'
import type { Permission } from '../api/assistants'

type PermissionPickerProps = {
  permissions: Permission[]
  value: string[]
  onChange: (value: string[]) => void
}

function permissionGroup(permission: Permission) {
  const prefix = permission.key.split('_')[0]
  if (prefix === 'students') return 'الطلاب'
  if (prefix === 'groups') return 'المجموعات'
  if (prefix === 'attendance') return 'الحضور'
  if (prefix === 'billing' || prefix === 'payments') return 'الفواتير'
  return 'عام'
}

export function PermissionPicker({ permissions, value, onChange }: PermissionPickerProps) {
  const grouped = permissions.reduce<Record<string, Permission[]>>((result, permission) => {
    const group = permissionGroup(permission)
    result[group] = [...(result[group] || []), permission]
    return result
  }, {})

  const toggleAll = () => onChange(value.length === permissions.length ? [] : permissions.map((permission) => permission.key))

  return (
    <Card bodyClassName="">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-primary-subtle text-primary">
            <ShieldCheck size={16} />
          </span>
          <div>
            <h3 className="text-[13px] font-bold text-text">صلاحيات الوصول</h3>
            <p className="mt-0.5 text-[11px] text-text-muted">حدد ما يمكن للمساعد مشاهدته وإدارته.</p>
          </div>
          <Badge variant="primary">{value.length} محددة</Badge>
        </div>
        <Button type="button" color="secondary" style="tint" size="xs" uppercase={false} leftIcon={value.length === permissions.length ? <Square size={13} /> : <CheckCheck size={13} />} onClick={toggleAll}>
          {value.length === permissions.length ? 'إلغاء الكل' : 'تحديد الكل'}
        </Button>
      </div>

      <CheckboxGroup value={value} onChange={onChange} className="mt-4 gap-4">
        {Object.entries(grouped).map(([group, items]) => (
          <section key={group}>
            <h4 className="mb-2 text-[11px] font-bold text-text-muted">{group}</h4>
            <div className="grid gap-2 sm:grid-cols-2">
              {items.map((permission) => (
                <CheckboxTile
                  key={permission.key}
                  value={permission.key}
                  label={permission.label || permission.key}
                  description={permission.key.replaceAll('_', ' ')}
                  className="border-none bg-neutral-100/70! p-0! hover:bg-neutral-100! focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-1"
                />
              ))}
            </div>
          </section>
        ))}
      </CheckboxGroup>
    </Card>
  )
}
