interface VideoInfo {
  /**
   * 时长，单位毫秒
   */
  duration: number,
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
   * 视频码率，单位bps
   */
  bitRate: number,
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
export const getVideoInfo = (file: File): Promise<VideoInfo> => {
  return new Promise((resolve, reject) => {
    const videoElement = document.createElement('video');
    videoElement.src = URL.createObjectURL(file);
    videoElement.addEventListener('loadedmetadata', () => {
      const width = videoElement.videoWidth;
      const height = videoElement.videoHeight;
      const duration = videoElement.duration;
      resolve({
        duration: duration * 1000,
        width,
        height,
        filename: file.name,
        fileFormat: file.type,
        filesize: file.size,
        bitRate: file.size / duration,
        aspectRatio: `${width}:${height}`,
        resolution: `${width}x${height}`,
      });
    });
    videoElement.addEventListener('error', error => {
      reject(error);
    });
  });
};

/**
 * 获取视频第一帧作为封面
 * url=>base64
 * @param config
 */
export const getVideoUrlBase64 = (config: {
  url: string;
  width?: number;
  height?: number;
  type?: string
}): Promise<string> => {
  const { url, width = 400, height = 240, type = 'image/jpeg' } = config;
  return new Promise(function (resolve, reject) {
    const videoElement = document.createElement('video');
    videoElement.setAttribute('crossOrigin', 'anonymous');//处理跨域
    videoElement.setAttribute('src', url);
    videoElement.setAttribute('width', `${width}`);
    videoElement.setAttribute('height', `${height}`);
    videoElement.setAttribute('preload', 'auto');
    videoElement.addEventListener('loadeddata', function () {
      const canvas = document.createElement('canvas');
      const width = videoElement.width; //canvas的尺寸和图片一样
      const height = videoElement.height;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(videoElement, 0, 0, width, height); // 绘制canvas
      const dataURL = canvas.toDataURL(type); // 转换为base64
      resolve(dataURL);
    });
    videoElement.addEventListener('error', function (error) {
      reject(error);
    });
  });
};

/**
 * 获取视频第一帧作为封面
 * file=>base64
 * @param file
 */
export const getVideoFileBase64 = (file: File): Promise<string> => {
  return new Promise(function (resolve, reject) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const url = e.target?.result as string;
      getVideoInfo(file).then((result) => {
        return getVideoUrlBase64({ url, width: result.width, height: result.height });
      }).then(result => {
        resolve(result);
      });
    };
    reader.onerror = function (error) {
      reject(error);
    };
    reader.readAsDataURL(file);
  });
};
