import { twMerge } from 'tailwind-merge'

export function cn(...classes: Array<string | false | undefined | null>) {
  return twMerge(classes.filter(Boolean).join(' '))
}
