import { abbreviation } from '@/assets/scripts/utils'

type FormatValueParams = {
  value: number
  prefix?: string
  suffix?: string
  limit?: number
  hasSNA?: boolean
  limitSNA?: number
}

type TruncateParams = {
  string: string
  start?: number
  end?: number
}

export const capitalize = (string: string): string => `${string.charAt(0).toUpperCase()}${string.slice(1)}`

const isWhole = (n: number): boolean => (n - Math.floor(n)) === 0

export const formatValue = ({
  value,
  prefix = '',
  suffix = '',
  limit = 2,
  hasSNA = false,
  limitSNA = 3,
}: FormatValueParams): string => {
  const nValue = Number(value)
  const nLimit = nValue === 0 || isWhole(nValue) ? 0 : limit
  const aboveOne = nValue > 1

  const [int, float] = nValue.toFixed(hasSNA && aboveOne ? 0 : nLimit).toString().split('.')
  const result = `${int.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}${float ? `.${float}` : ''}`.trim()

  if (!hasSNA || !aboveOne) return `${prefix}${result} ${suffix}`.trim()

  const parts = result.split(',')
  if (parts.length > abbreviation.length) throw new Error('value number is too big')

  const partIndex = parts.length - 1
  const mantissa = nValue / (1000 ** partIndex)
  const mantissaFixed = mantissa.toFixed(partIndex ? limitSNA - String(mantissa).split('.')[0].length : 0)
  const mantissaCleared = mantissaFixed.replace(partIndex && mantissaFixed.includes('.') ? /0+$/g : '', '').replace(/\.$/, '')

  return `${prefix}${mantissaCleared}${abbreviation[partIndex]} ${suffix}`.trim()
}

const truncateString = ({ string, start = 5, end = 5 }: TruncateParams): string => `${string.slice(0, start)}…${string.slice(string.length - end)}`
export const truncate = (args: string | TruncateParams): string => (typeof args === 'string' ? truncateString({ string: args }) : truncateString(args))

export const serializeQuery = (url: string, params: Record<string, string>) => (
  Object.keys(params).length
    ? `${url}?${new URLSearchParams(params).toString()}`
    : url
)
