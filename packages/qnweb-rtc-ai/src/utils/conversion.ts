/**
 * dataUrl 转 file
 * @param dataUrl
 * @param filename
 */
export function dataURLToFile(
  dataUrl: string,
  filename: string
) {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

/**
 * blob转base64
 * @param blob
 */
export function blobToBase64(blob: Blob) {
  return new Promise<string>(resolve => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onload = function () {
      resolve(reader.result as string);
    };
  });
}

/**
 * blob二进制 to base64
 * @param blob
 */
export function blobToDataURI(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function (e) {
      resolve(e.target.result + '');
    };
    reader.onerror = function () {
      reject('Failed to read file!\n\n' + reader.error);
    };
    reader.readAsDataURL(blob);
  });
}
