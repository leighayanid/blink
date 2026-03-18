export const getPlatformLabel = (platform: string): string => {
  const map: Record<string, string> = {
    Windows: 'WIN',
    macOS: 'MAC',
    Linux: 'LIN',
    Android: 'AND',
    iOS: 'IOS',
    Unknown: 'UNK'
  }
  return map[platform] || 'UNK'
}

export const getPlatformIcon = (platform: string): string => {
  const lower = platform.toLowerCase()
  if (lower.includes('android') || lower.includes('ios')) return 'i-lucide-smartphone'
  if (lower.includes('win') || lower.includes('mac') || lower.includes('linux')) return 'i-lucide-monitor'
  return 'i-lucide-cpu'
}
