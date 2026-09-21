import type { ReactNode } from 'react'
import { useFormContext, type FieldPath } from 'react-hook-form'

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '@teachedo/ui/components'

import type { SettingsFormValues } from '../schemas/settings.schema'

type SettingsFieldProps = {
  name: FieldPath<SettingsFormValues>
  label: string
  description: string
  type?: 'text' | 'email' | 'number' | 'tel'
  disabled?: boolean
  dir?: 'ltr' | 'rtl'
  startIcon?: ReactNode
  endContent?: ReactNode
}

export function SettingsField({
  name,
  label,
  description,
  type = 'text',
  disabled,
  dir,
  startIcon,
  endContent,
}: SettingsFieldProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext<SettingsFormValues>()
  const error = errors[name]?.message
  const inputId = `settings-${name}`

  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel htmlFor={inputId}>{label}</FieldLabel>
      <FieldContent>
        <InputGroup data-disabled={disabled}>
          {startIcon && (
            <InputGroupAddon align="inline-start">
              <InputGroupText>{startIcon}</InputGroupText>
            </InputGroupAddon>
          )}
          <InputGroupInput
            id={inputId}
            type={type}
            dir={dir}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            {...register(name, { valueAsNumber: type == 'number', disabled })}
          />
          {endContent && (
            <InputGroupAddon align="inline-end">
              <InputGroupText>{endContent}</InputGroupText>
            </InputGroupAddon>
          )}
        </InputGroup>
        <FieldDescription>{description}</FieldDescription>
        <FieldError>{typeof error === 'string' ? error : undefined}</FieldError>
      </FieldContent>
    </Field>
  )
}
