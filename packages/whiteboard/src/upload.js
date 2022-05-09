import OSS from "ali-oss"


export default class Upload {
  constructor() {

  }
  static multipartUpload(file, action, community) {

  
    console.log("upload " + action.name + " with mime type:" + file.type);
  
    var type = file.type;
    let client = new OSS({
      secure: true,
      endpoint: controller.config.ossEndPoint,
      // region: accessKey.region,
      stsToken: action.accessKey.securityToken,
      accessKeyId: action.accessKey.accessKeyId,
      accessKeySecret: action.accessKey.accessKeySecret,
      bucket: community ? config.public_bucket : controller.config.ossBucket
    });
    client.multipartUpload(action.objectName, file, {meta: {filename: encodeURIComponent(action.name), md5: action.md5},mime:type}).then(() => {
      // console.log('dddddddddddddddddddddddd',action.objectName)
      action.callback(action.objectName);
    }).catch(err => {
      // screen_instance.prompt_screen(`文件上传失败，请重试`, `error`);
//      app_pool.buried_point(`count`, `upload_failed`, `${action.objectName}-${err}`);
      console.log("error upload ",err);
    });
  }
}
