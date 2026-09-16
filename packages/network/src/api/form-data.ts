export type FormDataValue =
  | string
  | number
  | boolean
  | File
  | Blob
  | null
  | undefined
  | FormDataValue[]
  | { [key: string]: FormDataValue };

function appendFormData(
  formData: FormData,
  key: string,
  value: FormDataValue,
): void {
  if (value == null) return;

  if (value instanceof Blob) {
    formData.append(key, value);
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      appendFormData(formData, `${key}[${index}]`, item);
    });
    return;
  }

  if (typeof value === "object") {
    Object.entries(value).forEach(([childKey, childValue]) => {
      appendFormData(formData, `${key}[${childKey}]`, childValue);
    });
    return;
  }

  formData.append(key, String(value));
}

export function toFormData(
  payload: Record<string, FormDataValue>,
): FormData {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    appendFormData(formData, key, value);
  });

  return formData;
}

export function isFormData(value: unknown): value is FormData {
  return value instanceof FormData;
}