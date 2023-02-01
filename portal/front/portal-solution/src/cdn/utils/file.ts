export function saveFile(filename: string, content: string) {
  const blob = new Blob([content])
  const a = document.createElement('a')
  const url = window.URL.createObjectURL(blob)
  a.href = url
  a.download = filename
  a.click()
  window.URL.revokeObjectURL(url)
}
