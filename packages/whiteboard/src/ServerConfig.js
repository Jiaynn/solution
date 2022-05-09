import request from './request.js'
import controller from './WhiteboardController.js'
export default class ServerConfig {
	construct() {
		this.ossBucket
		this.ossEndPoint
		this.ossStsUrl
		this.sdkApiHost = 'https://api.latitech.com:8888/Chatboard'
		this.sdkFileHost
		this.thumbnailsBucket
		this.thumbnailsFileGroupId
		this.thumbnailsHost
		this.webSocketHost
		this.joinString
	}

	init_config(json_config) {
		this.ossBucket = json_config['oss_bucket']
		this.ossEndPoint = json_config['oss_end_point']
		this.ossStsUrl = json_config['oss_sts_url']
		this.sdkApiHost = `${json_config.sdk_api_host}/Chatboard`
		this.sdkFileHost = `${json_config.sdk_file_host}`
		this.thumbnailsBucket = json_config['thumbnails_bucket']
		this.thumbnailsFileGroupId = json_config['thumbnails_file_groupId']
		this.thumbnailsHost = json_config['thumbnails_host']
		this.webSocketHost = json_config['web_socket_host']
		this.joinString = JSON.parse(json_config['join_room_str'])
	}
	obtain_oss_accessKey(obj) {
		if (obj.callback && obj.superior.accessKey)
			obj.callback(obj.superior.accessKey)
		if (!obj.callback || (obj.callback && !obj.superior.accessKey))
			request
				.accessKey(
					obj.fileGroupId ||
						(obj.superior && obj.superior.fileGroupId)
				)
				.then((accessKey) => {
					setTimeout(
						() =>
							this.obtain_oss_accessKey({
								superior: obj.superior,
							}),
						1800000
					)
					if (obj.callback) obj.callback(accessKey)
					obj.superior.accessKey = accessKey
				})
				.catch((msg) => controller.onEvent(`error`, msg))
	}
}
