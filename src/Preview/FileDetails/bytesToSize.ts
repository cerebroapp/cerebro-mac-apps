const sizes = ['B', 'KB', 'MB', 'GB', 'TB']

/**
 * Convert bytes to human readable string
 */
export default function bytesToSize (bytes: number): string {
  if (bytes === 0) return '0B'
  const i = parseInt(String(Math.floor(Math.log(bytes) / Math.log(1024))), 10)
  return [
    Math.round(bytes / Math.pow(1024, i)),
    sizes[i]
  ].join(' ')
}
