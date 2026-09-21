import * as React from "react"
import { EyeIcon, EyeOffIcon, KeyRoundIcon, RefreshCwIcon } from "lucide-react"

import { cn } from "cn"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "./input-group"

type PasswordStrength = {
  score: number
  label: string
}

export type PasswordInputProps = Omit<
  React.ComponentProps<typeof InputGroupInput>,
  "type" | "value" | "defaultValue" | "onChange"
> & {
  value?: string
  defaultValue?: string
  onChange?: React.ChangeEventHandler<HTMLInputElement>
  label?: React.ReactNode
  description?: React.ReactNode
  error?: React.ReactNode
  showStrength?: boolean
  showGenerator?: boolean
  generatorLength?: number
}

function getPasswordStrength(value: string): PasswordStrength {
  if (!value) return { score: 0, label: "" }

  let score = 0
  if (value.length >= 8) score += 1
  if (value.length >= 12) score += 1
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score += 1
  if (/\d/.test(value) || /[^A-Za-z0-9]/.test(value)) score += 1

  return {
    score,
    label: ["ضعيفة", "مقبولة", "جيدة", "قوية"][Math.max(score - 1, 0)] ?? "قوية",
  }
}

function createStrongPassword(length: number) {
  const groups = [
    "ABCDEFGHJKLMNPQRSTUVWXYZ",
    "abcdefghijkmnopqrstuvwxyz",
    "23456789",
    "!@#$%^&*",
  ]
  const alphabet = groups.join("")
  const passwordLength = Math.max(length, 12)
  const values = new Uint32Array(passwordLength)
  crypto.getRandomValues(values)
  const password = groups.map((group, index) => group[(values[index] ?? 0) % group.length])
  password.push(...Array.from(values.slice(groups.length), (value) => alphabet[value % alphabet.length]))

  return password
    .slice(0, passwordLength)
    .sort(() => 0.5 - Math.random())
    .join("")
}

const strengthColors = [
  "bg-destructive",
  "bg-warning",
  "bg-info",
  "bg-success",
]

const strengthLabels = ["ضعيفة", "مقبولة", "جيدة", "قوية"]

function PasswordInput({
  className,
  label,
  description,
  error,
  showStrength = true,
  showGenerator = false,
  generatorLength = 16,
  value,
  defaultValue,
  onChange,
  disabled,
  id,
  ...props
}: PasswordInputProps) {
  const generatedId = React.useId()
  const inputId = id ?? generatedId
  const [visible, setVisible] = React.useState(false)
  const [internalValue, setInternalValue] = React.useState(value ?? defaultValue ?? "")
  const currentValue = value ?? internalValue
  const strength = getPasswordStrength(currentValue)

  React.useEffect(() => {
    if (value !== undefined) setInternalValue(value)
  }, [value])

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    setInternalValue(event.target.value)
    onChange?.(event)
  }

  const generatePassword = () => {
    const generated = createStrongPassword(generatorLength)
    setInternalValue(generated)
    onChange?.({
      target: { value: generated, name: props.name },
      currentTarget: { value: generated, name: props.name },
    } as React.ChangeEvent<HTMLInputElement>)
  }

  return (
    <div className="flex w-full flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className={cn("text-xs font-medium", error ? "text-destructive" : "text-text")}>
          {label}
        </label>
      )}
      <InputGroup className={cn(error && "border-destructive", className)} data-disabled={disabled || undefined}>
        <InputGroupAddon align="inline-start">
          <KeyRoundIcon aria-hidden="true" />
        </InputGroupAddon>
        <InputGroupInput
          {...props}
          id={inputId}
          value={value}
          defaultValue={value === undefined ? defaultValue : undefined}
          type={visible ? "text" : "password"}
          autoComplete={props.autoComplete ?? "new-password"}
          disabled={disabled}
          aria-invalid={error ? true : props["aria-invalid"]}
          onChange={handleChange}
        />
        {showGenerator && (
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              type="button"
              size="icon-xs"
              aria-label="توليد كلمة مرور قوية"
              title="توليد كلمة مرور قوية"
              onClick={generatePassword}
              disabled={disabled}
            >
              <RefreshCwIcon aria-hidden="true" />
            </InputGroupButton>
          </InputGroupAddon>
        )}
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            type="button"
            size="icon-xs"
            aria-label={visible ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
            title={visible ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
            aria-pressed={visible}
            onClick={() => setVisible((current) => !current)}
            disabled={disabled}
          >
            {visible ? <EyeOffIcon aria-hidden="true" /> : <EyeIcon aria-hidden="true" />}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      {showStrength && currentValue && (
        <div className="flex items-center gap-2" aria-live="polite">
          <div className="flex flex-1 gap-1" aria-label={`قوة كلمة المرور: ${strength.label}`}>
            {strengthLabels.map((_, index) => (
              <span
                key={index}
                aria-hidden="true"
                className={cn("h-1 flex-1 rounded-full bg-border", index < strength.score && strengthColors[strength.score - 1])}
              />
            ))}
          </div>
          <span className="text-[11px] text-text-muted">{strength.label}</span>
        </div>
      )}
      {(error || description) && (
        <p className={cn("text-[11px] leading-relaxed", error ? "text-destructive" : "text-text-muted")}>
          {error || description}
        </p>
      )}
    </div>
  )
}

export { PasswordInput }