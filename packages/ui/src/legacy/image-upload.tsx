import { useEffect, useRef, useState } from 'react'
import { Link2, Upload, UserRound } from 'lucide-react'

export type ImageUploadProps = {
  value?: string
  onChange: (value: string) => void
  onFileChange?: (file: File | undefined) => void
  label?: string
  description?: string
  disabled?: boolean
}

export function ImageUpload({
  value = '',
  onChange,
  onFileChange,
  label = 'الصورة الشخصية',
  description = 'يفضل أن تكون مربعة الشكل بصيغة PNG أو JPG وبحجم لا يتجاوز 5 ميجابايت.',
  disabled = false,
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [mode, setMode] = useState<'upload' | 'url'>('upload')
  const [preview, setPreview] = useState(value)

  useEffect(() => {
    setPreview(value)
  }, [value])

  const selectFile = (file?: File) => {
    if (!file || disabled) return
    const localPreview = URL.createObjectURL(file)
    setPreview(localPreview)
    onFileChange?.(file)
  }

  return (
    <div className="flex flex-col items-start gap-4 sm:flex-row">
      <div className="relative shrink-0 group">
        <button
          type="button"
          disabled={disabled || mode !== 'upload'}
          onClick={() => fileInputRef.current?.click()}
          className={`relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-sm border-2 border-dashed border-border bg-surface-secondary transition-all duration-200 ${mode === 'upload' && !disabled ? 'cursor-pointer hover:border-primary hover:bg-primary-subtle/20' : 'cursor-default'}`}
        >
          {preview ? (
            <img src={preview} alt={label} className="h-full w-full object-cover" />
          ) : (
            <UserRound size={32} className="text-border" />
          )}
          {mode === 'upload' && preview && (
            <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100">
              <Upload size={20} />
            </span>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          disabled={disabled}
          onChange={(event) => {
            void selectFile(event.target.files?.[0])
            event.target.value = ''
          }}
        />
      </div>

      <div className="flex w-full flex-1 flex-col gap-2 pt-2">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold text-text">{label}</h3>
        <div className="flex w-fit items-center rounded-sm bg-neutral-100 p-1">
          <button
            type="button"
            disabled={disabled}
            onClick={() => setMode('upload')}
            className={`flex items-center gap-1.5 rounded-sm px-3 py-1 text-xs font-medium transition-all ${mode === 'upload' ? 'bg-surface text-primary' : 'text-text-muted hover:text-text'}`}
          >
            <Upload size={13} />
            رفع من الجهاز
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => setMode('url')}
            className={`flex items-center gap-1.5 rounded-sm px-3 py-1 text-xs font-medium transition-all ${mode === 'url' ? 'bg-surface text-primary' : 'text-text-muted hover:text-text'}`}
          >
            <Link2 size={13} />
            رابط مباشر
          </button>
        </div>
        <div className="mt-1 w-full max-w-lg">
          {mode === 'upload' ? (
            <p className="text-xs leading-relaxed text-text-muted">
              انقر على المربع لاختيار صورة، {description}
            </p>
          ) : (
            <input
              value={value}
              disabled={disabled}
              onChange={(event) => {
                onChange(event.target.value)
                setPreview(event.target.value)
              }}
              placeholder="https://example.com/photo.jpg"
              className="h-8 w-full rounded-sm border border-input-border bg-input-background px-2 text-xs text-text outline-none focus:border-input-border-focus"
              dir="ltr"
            />
          )}
        </div>
      </div>
    </div>
  )
}
