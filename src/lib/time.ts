export function parseElapsedTime(value: string): number {
  const [hours = '0', minutes = '0', seconds = '0'] = value.split(':')

  return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds)
}

export function formatElapsedTime(totalSeconds: number): string {
  const safeTotal = Math.max(0, totalSeconds)
  const hours = Math.floor(safeTotal / 3600)
  const minutes = Math.floor((safeTotal % 3600) / 60)
  const seconds = safeTotal % 60

  return [hours, minutes, seconds].map((part) => String(part).padStart(2, '0')).join(':')
}
