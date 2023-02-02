interface ImgInfo {
  /**
   * 视频宽度
   */
  width: number,
  /**
   * 视频高度
   */
  height: number,
  /**
   * 文件名
   */
  filename: string,
  /**
   * 文件类型
   */
  fileFormat: string,
  /**
   * 文件大小，单位字节
   */
  filesize: number,
  /**
   * 画幅比
   */
  aspectRatio: string,
  /**
   * 分辨率
   */
  resolution: string,
}

/**
 * 获取视频文件信息
 * @param file
 */
export const getImgInfo = (file: File): Promise<ImgInfo> => {
  return new Promise((resolve, reject) => {
    const element = document.createElement('img');
    element.src = URL.createObjectURL(file);
    element.addEventListener('load', () => {
      const width = element.naturalWidth;
      const height = element.naturalHeight;
      resolve({
        width,
        height,
        filename: file.name,
        fileFormat: file.type,
        filesize: file.size,
        aspectRatio: `${width}:${height}`,
        resolution: `${width}x${height}`,
      });
    });
    element.addEventListener('error', error => {
      reject(error);
    });
  });
};
