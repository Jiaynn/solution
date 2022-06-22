/**
 * 基础下载功能
 * @param url
 * @param fileName
 */
export function baseDownload(url: string, fileName: string) {
  const downloadLink = document.createElement('a');
  document.body.append(downloadLink);
  downloadLink.href = url;
  downloadLink.download = fileName;
  downloadLink.click();
  document.body.removeChild(downloadLink);
}