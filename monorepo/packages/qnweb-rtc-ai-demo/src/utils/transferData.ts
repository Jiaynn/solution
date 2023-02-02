import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

/**
 * blob二进制 to base64
 * @param blob
 */
export function blobToDataURI(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function(e) {
      resolve(e.target.result + '');
    };
    reader.onerror = function(event) {
      reject('Failed to read file!\n\n' + reader.error);
    };
    reader.readAsDataURL(blob);
  });
}

/**
 * ffmpeg 把 webm 转成 mp4
 * @param blobURL
 */
export async function webmToMp4(blobURL: string): Promise<string> {
  const ffmpeg = createFFmpeg({ log: true });
  await ffmpeg.load();
  const inputFileName = 'download.webm';
  const outputFileName = 'output.mp4';
  ffmpeg.FS('writeFile', inputFileName, await fetchFile(blobURL));
  await ffmpeg.run('-i', inputFileName, outputFileName);
  const data = ffmpeg.FS('readFile', outputFileName);
  return URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
}