/**
 * 图片最大尺寸
 */
interface MaxSize {
  maxWidth: number;
  maxHeight: number;
}

/**
 * 压缩图片
 * @param base64
 * @param maxSize - 图片最大尺寸，超出即需要压缩
 */
export function compress(
  base64: string,
  maxSize: MaxSize
): Promise<string> {
  return new Promise(resolve => {
    const img: HTMLImageElement = new Image();
    img.src = base64;
    img.onload = function () {
      const { maxWidth, maxHeight } = maxSize;
      if (img.width * img.height >= maxWidth * maxHeight) {
        /**
         * 超出最大尺寸，需要进行压缩
         */
        const canvas = document.createElement<'canvas'>('canvas');
        const maxRatio = Math.max(img.width / maxWidth, img.height / maxHeight);
        const outputWidth = img.width / maxRatio;
        const outputHeight = img.height / maxRatio;
        canvas.setAttribute('width', outputWidth + '');
        canvas.setAttribute('height', outputHeight + '');
        canvas.getContext('2d')?.drawImage(img, 0, 0, outputWidth, outputHeight);
        const base64 = canvas.toDataURL('image/png');
        resolve(base64);
      } else {
        resolve(base64);
      }
    };
  });
}

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