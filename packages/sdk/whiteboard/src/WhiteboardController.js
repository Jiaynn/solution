import download from './download'
import webAssembly from './WhiteboardNativeController.js'
import ServerConfig from './ServerConfig.js'
import request from './request.js'
import webSocket from './WebSocket.js'
import RoomInfo from './RoomInfo.js'
import Member from './Member.js'
import messageProcessor from './WhiteboardMessageProcessor.js'
import device from 'current-device'
import tool from './Tool.js'
import upload from './upload'

class WhiteboardController {
	// 当前 canvas 实际尺寸
	constructor() {
		//初始化服务器配置
		this.tool = new tool()
		this.room = new RoomInfo()
		this.joinUrl = ''
		this.me = new Member()
		this.members = new Array()
		this.config = new ServerConfig()
		webSocket.onConnected = this.onWebsocketConnected.bind(this)
		webSocket.onDisconnect = this.onWebsocketClosed.bind(this)
		webSocket.onError = this.onWebsocketError.bind(this)
		webSocket.onMessage = messageProcessor.onMessage.bind(messageProcessor)
		this.keepConnection = true
		this.webAssemblyReady = false
		this.activeDocumentId = ''
		this.documentWidth = 0
		this.documentHeight = 0
		this.Event = {
			AllEvent: 0,
			PageListChanged: 1,
			PageChanged: 2,
			WebassemblyReady: 3,
			WhiteboardSizeChanged: 4,
			JoinRoomError: 5,
			DocumentChange: 6,
			BackgroundChange: 7,
			WidgetActivity: 8,
			FileFlip: 9,
			RecoveryState: 10,
			WidgetAction: 11,
			WidgetScroll: 12,
		}
		this.callbackMap = Object.keys(this.Event).reduce(
			(prevMap, eventType) => {
				return prevMap.set(this.Event[eventType], [])
			},
			new Map()
		)
		this.documents = new Array()
		this.documentId = ''
		this.activity_file = new Map()
		this.isWebglContextLost = false
		this.canvas = null
		this.elementId = ''
		this.mousemove = false
		this.isPhone = /Android|webOS|iPhone|iPod|BlackBerry/i.test(
			navigator.userAgent
		)
		this.position = { x: 0, y: 0, force: 0 }
	}

	upload_file(obj) {
		let file = obj.file,
			file_mes = tool.file_supported(file.name)
		let left = obj.left
		let top = obj.top
		let width = obj.width
		let height = obj.height

		if (!file_mes.is_support) return console.error('格式不支持')
		// screen_instance.loading_screen(`文件上传中`);
		let resourceId = tool.generateUUID()
		if (file_mes.file_type) upload_file.call(this, file)
		else
			tool.image_processing(file, (processed) =>
				upload_file.call(this, processed)
			)

		function upload_file(processed) {
			// console.log('this------------',this,processed.size,file_mes)
			console.log('timemeasure:before create calc md5:', Date.now())
			tool.spark_md5(processed, (md5) => {
				console.log('timemeasure:after create calc md5:', Date.now())
				this.uploading_file({
					resourceId: resourceId,
					fileSize: processed.size,
					fileType: file_mes.file_type,
					extension: file_mes.extension,
					left: left,
					md5: md5,
					top: top,
					width: width,
					height: height,
					command: `uploadingFileAction`,
				})
				console.log('timemeasure:after uploading calc md5:', Date.now())
				let fileGroupId = obj.superior.fileGroupId
				console.log(
					'timemeasure:before resourcee exist check:',
					Date.now()
				)
				request.exist(md5, file.name, fileGroupId).then((result) => {
					console.log(
						'timemeasure:after resource exist check:',
						Date.now()
					)
					if (result) addResource(result)
					else {
						console.log(
							'timemeasure:before upload resource check:',
							Date.now()
						)
						let objectName = `${fileGroupId}/${tool.generateUUID()}.${
							file_mes.extension
						}`
						controller.config.obtain_oss_accessKey({
							superior: obj.superior,
							callback: (accessKey) => {
								upload.multipartUpload(processed, {
									md5,
									name: file.name,
									resourceId,
									objectName,
									accessKey,
									callback: () => addResource(objectName),
								})
							},
						})
					}

					function addResource(objectName) {
						// obj.controls.value = ``;
						console.log(
							'timemeasure:after upload resource check:',
							Date.now()
						)
						let userId =
							obj.superior.accountId ||
							(obj.superior && obj.superior.userId)
						let attach = { objectName, resourceId, userId }
						// console.log('add------',objectName,userId,attach,obj)
						// if (obj.origin === process.origin2) attach.catalogId = obj.catalogId;
						// obj.superior - store.session; app_pool.meetingInfo.message
						request
							.addResource(
								resourceInfo(
									obj.superior.sessionId ||
										obj.superior.session.sessionId,
									fileGroupId,
									file.name,
									attach
								)
							)
							.then(() => {
								console.log(
									'timemeasure:after addResource upload resource check:',
									Date.now()
								)
								if (obj.callback) obj.callback()
							})
							.catch((e) => {
								console.log('add resource error:', e)
								if (obj.callback) obj.callback(e)
							})
					}
				})
			})
		}

		let resourceInfo = (sessionId, fileGroupId, resourceName, attach) => {
			return Object.assign(
				{ sessionId, fileGroupId, resourceName },
				attach
			)
		}
	}

	initialize(join_url) {
		let cvs = document.createElement('canvas')
		cvs.id = 'canvas'
		cvs.tabindex = -1
		cvs.oncontextmenu = (e) => {
			e.preventDefault()
		}
		this.canvas = cvs
		// this.registerCanvasEvnet()
		window.onresize = (e) => webAssembly.window_resize(e)
		webAssembly.registered()
		this.joinUrl = join_url
		console.log('webAssembly registered')
		this.initializeEnvForWebassembly()
	}

	// 注册canvas鼠标/手指操作事件
	registerCanvasEvnet() {
		this.canvas.addEventListener('mousedown', (event) => {
			if (!this.isPhone) this.pointerEvent(event)
		})
		this.canvas.addEventListener('mousemove', (event) => {
			if (this.mousemove && !this.isPhone) this.pointerEvent(event)
		})
		this.canvas.addEventListener('mouseup', (event) => {
			if (this.mousemove && !this.isPhone) this.pointerEvent(event)
		})
		this.canvas.addEventListener('mouseout', (event) => {
			if (this.mousemove && !this.isPhone) this.pointerEvent(event)
		})
		this.canvas.addEventListener('touchstart', (event) => {
			this.pointerEvent(event)
		})
		this.canvas.addEventListener('touchmove', (event) => {
			this.pointerEvent(event)
		})
		this.canvas.addEventListener('touchend', (event) => {
			this.pointerEvent(event)
		})
	}

	// 挂载canvas
	mountCanvas(elementId) {
		if (document.getElementById(elementId)) {
			this.elementId = elementId
			document.getElementById(this.elementId).appendChild(this.canvas)
		} else {
			console.error(`can not find "${elementId}" node!`)
		}
	}

	// 卸载canvas
	unloadCanvs() {
		if (this.elementId && document.getElementById(this.elementId)) {
			document.getElementById(this.elementId).innerHTML = ''
		} else {
			console.error(`No node to be uninstalled is found!`)
		}
	}

	/**
	 * 销毁 webgl 上下文
	 */
	destroyWebglContext() {
		if (window.GLctx && window.GLctx.getExtension) {
			window.GLctx.getExtension('WEBGL_lose_context').loseContext()
		}
	}

	initializeEnvForWebassembly() {
		console.log('initializeEnvForWebassembly')
		const that = this
		const baseModule =
			typeof window.Module !== 'undefined' ? window.Module : {}
		window.Module = {
			...baseModule,
			preRun: [],
			postRun: [],
			print: (function () {
				var e = document.getElementById('output')
				return (
					e && (e.value = ''),
					function (t) {
						arguments.length > 1 &&
							(t = Array.prototype.slice
								.call(arguments)
								.join(' ')),
							console.log('t----------------------------', t),
							e &&
								((e.value += t + '\n'),
								(e.scrollTop = e.scrollHeight))
					}
				)
			})(),
			printErr: function (e) {
				arguments.length > 1 &&
					(e = Array.prototype.slice.call(arguments).join(' ')),
					console.warn('e-----------', e)
			},
			canvas: (function () {
				const canvas = that.canvas
				console.log('canvas')
				return (
					canvas.addEventListener(
						'webglcontextlost',
						function (e) {
							// alert('WebGL context lost. You will need to reload the page.'),
							that.isWebglContextLost = true
							e.preventDefault()
						},
						!1
					),
					canvas
				)
			})(),
			setStatus: function (e) {
				// if (
				//   (Module.setStatus.last ||
				//     (Module.setStatus.last = { time: Date.now(), text: "" }),
				//   e !== Module.setStatus.last.text)
				// ) {
				//   var t = e.match(/([^(]+)\((\d+(\.\d+)?)\/(\d+)\)/),
				//     n = Date.now();
				//   (t && n - Module.setStatus.last.time < 30) ||
				//     ((Module.setStatus.last.time = n),
				//     (Module.setStatus.last.text = e),
				//     t
				//       ? ((e = t[1]),
				//         (progressElement.value = 100 * parseInt(t[2])),
				//         (progressElement.max = 100 * parseInt(t[4])),
				//         (progressElement.hidden = !1),
				//         (spinnerElement.hidden = !1))
				//       :
				//       ((progressElement.value = null),
				//         (progressElement.max = null),
				//         (progressElement.hidden = !0),
				//         e ||
				//         ((spinnerElement.style.display = "none") && (shadeElement.style.display = "none")&&(canvasOff = true))),
				//     (statusElement.innerHTML = e));
				// }
			},
			totalDependencies: 0,
			monitorRunDependencies: function (e) {
				;(this.totalDependencies = Math.max(this.totalDependencies, e)),
					Module.setStatus(
						e
							? 'Preparing... (' +
									(this.totalDependencies - e) +
									'/' +
									this.totalDependencies +
									')'
							: 'All downloads complete.'
					)
			},
		}
		window.Module.setStatus('Downloading...'),
			(window.onerror = function (e) {
				Module.setStatus('Exception thrown, see JavaScript console'),
					// (spinnerElement.style.display = "none"),
					(Module.setStatus = function (e) {
						e && Module.printErr('[post-exception status] ' + e)
					})
			})
	}

	join_room(appId, meetingId, userId, token, callback) {
		this.room.appId = appId
		this.room.meetingId = meetingId
		this.room.userId = userId
		this.room.token = token
		if (callback) this.joinRoomCallback = callback

		if (this.webAssemblyReady) {
			console.log('join room ')
			this.open_room()
			request
				.getRoomInfo(this.joinUrl, appId, meetingId, userId, token)
				.then((info) => {
					console.log('reqeust join room info:')
					console.log(info)
					this.config.init_config(info)
					console.log(info)
					webSocket.socket_connection(
						this.config.webSocketHost,
						this.joinRoomCallback
					)
				})
				.catch((error) => {
					this.dispatchEvent(this.Event.JoinRoomError, error)
				})
		}
	}

	leave_room() {
		this.keepConnection = false
		this.close_room()
		webSocket.reset()
		download.file_cache = []

		download.queue_init()

		request.leaveMeeting(this.me.sessionId)
	}

	onWebsocketConnected(event) {
		// if(webAssembly.webassembly_initlaized)
		{
			request.joinMeeting(this.config.joinString)
		}
	}

	onWebsocketClosed(event) {
		webSocket.close()
	}

	onWebsocketError(event) {}

	// 打开房间
	open_room() {
		webAssembly.send_message({ command: `openRoom`, params: `` }, 0)
	}

	// 关闭房间
	close_room() {
		this.keepConnection = false
		webAssembly.send_message({ command: `closeRoom`, params: `` }, 0)
	}

	// 初始化白板配置
	init_config(params) {
		console.log(params)
		webAssembly.set_size(this.set_canvas_style(params))
		webAssembly.whiteboard_size = {
			width: params.width,
			height: params.height,
		}
		this.me.roleId = params.roles
		this.me.sessionId = params.session.sessionId
		this.me.userId = params.session.userId
		this.room.meetingId = params.meetingId
		this.room.chatRoomId = params.chatRoomId
		this.room.fileGroupId = params.fileGroupId
		webAssembly.send_message(
			{
				command: `initConfig`,
				width: params.width,
				height: params.height,
				devicePixelRatio: window.devicePixelRatio,
				userId: params.session.userId,
				fileGroupId: params.fileGroupId,
				sessionId: params.session.sessionId,
				isMac: Number(device.macos()),
			},
			0
		)
	}

	// widget翻页
	flip_widget(params) {
		push_command(`flipWidget`, params)
	}

	// widget缩放
	scale_widget(params) {
		push_command(`scaleWidget`, params)
	}

	// 删除widget
	delete_widget(widgetId) {
		push_command(`deleteWidget`, { widgetId: widgetId })
	}

	// 还原笔迹
	rubber_undo() {
		push_command(`restore`, ``)
	}

	// 清空undo回收站
	clear_recovery() {
		push_command(`clearRecovery`, ``)
	}

	// 设置是否可以删除白板内其他人的创作内容
	enable_delete_others(enable) {
		push_command(`enableDeleteOthers`, { enable: enable })
	}

	// 取消选择框
	cancel_select() {
		push_command(`cancelSelect`, ``)
	}

	// 固化选择框
	steady_select() {
		push_command(`steadySelect`, ``)
	}

	// 反固化选择框
	release_select(widgetId) {
		push_command(`releaseSelect`, { widgetId })
	}

	// 设置白板输入模式属性
	set_pen_style(params) {
		push_command(`updatePenStyle`, params)
	}

	// 设置白板输入模式
	set_input_mode(mode) {
		push_command(`updateInputMode`, { mode: this.mode(mode) })
	}

	// 设置橡皮参数
	set_erase_size(size) {
		push_command(`updateEraseSize`, { size: size })
	}

	// 设置图形模式  // 矩形 - 0 圆 - 1 线 - 3 箭头 - 6
	//   set_geometry_mode: mode => push_command(`updateGeometry`, {mode: mode}),
	set_geometry_mode(mode) {
		push_command(`updateGeometry`, { mode: mode })
	}

	// 设置白板的背景色
	set_whiteboard_back(theme) {
		push_command(`setBackgroundColor`, { color: theme })
	}

	// 设置是否支持选择svg
	enable_select_svg() {
		push_command(`enableSelectSvg`, { enable: config.select_svg })
	}

	// 新建文档
	new_document() {
		push_command(`newDocument`, ``)
	}

	// 切换文档
	cut_document(widgetId) {
		push_command(`cutDocument`, { widgetId: widgetId })
	}

	// 插入文档
	insert_document(widgetId) {
		push_command(`insertDocument`, { widgetId: widgetId })
	}

	// 删除文档
	delete_document(widgetId) {
		push_command(`deleteDocument`, { widgetId: widgetId })
	}

	// 回放文件初始化
	playback(params) {
		push_command(`playback`, params)
	}

	// 回放下载action
	download_action(params) {
		webAssembly.send_message(params, 0)
	}

	// 回放操作
	playback_operation(params) {
		if (params.type === 3) download.queue_init()
		push_command(`playbackOperation`, params)
	}

	// 白板委托http请求数据回传
	file_network(params) {
		webAssembly.send_message(params, 0)
	}

	// pdf转换图片完成回传
	read_pdf(params) {
		webAssembly.send_message(params, 0)
	}

	// 文件上传中
	uploading_file(params) {
		webAssembly.send_message(params, 0)
	}

	// 文件下载地址回传
	send_download_url(params) {
		console.log('下载地址回传参数===================', params)
		webAssembly.send_message(params, 0)
	}

	// 插入云盘文件
	insert_cloud_file(params) {
		push_command(`insertCloudFile`, params)
	}

	//清空页面
	clear_page(params) {
		push_command(`cleanPage`, params)
	}
	// text生成图片完成
	text_ready(params) {
		webAssembly.send_message(params, 0)
	}

	// 插入text
	insert_text(params) {
		push_command(`insertText`, params)
	}

	// 更新text
	update_text(params) {
		push_command(`updateText`, params)
	}

	// 请求白板：文字图片是否存在
	judge_file(params) {
		webAssembly.send_message(params, 0)
	}

	// 请求待编辑的文字信息
	get_text_content(params) {
		get_data(`getTextContent`, params)
	}

	update_canvas_size(params) {
		webAssembly.set_size(params, true)
	}
	// 插入 svg
	insert_svg(params) {
		push_command(`insertSvg`, params)
	}

	// svg 生成图片完成
	svg_ready(params) {
		webAssembly.send_message(params, 0)
	}

	// 白板操作模式枚举
	mode(type) {
		// 普通模式
		let mode = 0
		// 橡皮模式
		if (type === `rubber`) mode = 1
		// 选择模式
		if (type === `select`) mode = 2
		// 图形模式
		if (type === `geometry`) mode = 3
		// 文字模式
		if (type === `text`) mode = 4
		return mode
	}

	current_page_id() {
		return this.documentId
	}

	// 白板内操作提示
	prompt(prompt) {
		let type = [
			{ type: 1, text: `文件` },
			{ type: 2, text: `图片` },
		].find((item) => item.type === prompt.type).text
		let operating = [
			{ type: 0, text: `上传` },
			{ type: 1, text: `删除` },
		].find((item) => item.type === prompt.action).text
		return `${prompt.user_name}${operating}了${type}`
	}

	// 二级菜单激活类型枚举（0 - 文档；1 - 文件；2 - 图片；3 - 图形；4 - 未知；5 - 选择；6 - svg；7 - 文字）
	activation(type) {
		return Boolean(
			[1, 2, 5, 6, 7].findIndex((item) => item === type) !== -1
		)
	}

	onNativeEventRaised(event, params) {
		console.log('=============传递触发白板事件参数', event, params)
		switch (event) {
			case this.Event.WebassemblyReady:
				{
					if (this.webAssemblyReady == false) {
						this.webAssemblyReady = true
						if (this.room.token != '') {
							this.join_room(
								this.room.appId,
								this.room.meetingId,
								this.room.userId,
								this.room.token
							)
						}
					}
					this.dispatchEvent(event, this.webAssemblyReady)
				}
				break
			case this.Event.DocumentChange:
				{
					this.activeDocumentId = params.widgetId
					this.dispatchEvent(event, params)
				}
				break
			case this.Event.WhiteboardSizeChanged:
				{
					this.documentWidth = params.currentWidth
					this.documentHeight = params.currentHeight
					this.dispatchEvent(event, params)
				}
				break
			default: {
				console.log('native event ' + event + ' occured:')
				console.log(event)
				this.dispatchEvent(event, params)
			}
		}
	}

	/* 初始化canvas */
	set_canvas_style(mes, is_playback, is_full_screen, is_PC) {
		let canvas = document.querySelector(`#canvas`),
			clientWidth = document.body.clientWidth,
			clientHeight = document.body.clientHeight
		let width = is_full_screen ? clientHeight : clientWidth,
			initialization__width = width,
			menu_height = clientWidth < 992 ? 35 : 20
		let height = is_full_screen
			? clientWidth
			: is_PC
			? clientHeight - 39
			: is_playback
			? clientHeight
			: clientHeight - menu_height
		// let devicePixelRatio = window.devicePixelRatio > 1.25 ? 1.25 : window.devicePixelRatio;
		let devicePixelRatio = window.devicePixelRatio
		if ((height * mes.width) / mes.height > width)
			height = (width * mes.height) / mes.width
		else width = (height * mes.width) / mes.height
		width = Math.floor(width)
		height = Math.floor(height)
		width = width % 2 === 1 ? width - 1 : width
		height = height % 2 === 1 ? height - 1 : height
		canvas.width = width * devicePixelRatio
		canvas.height = height * devicePixelRatio
		canvas.style.cssText += `width: ${width}px; height: ${height}px; 
        left: ${(initialization__width - width) / 2}px; 
        top: ${is_playback ? (is_PC ? 0 : 20) : menu_height / 2}px;
        border-radius: 5px; z-index: 1`
		if (is_playback)
			document.querySelector(
				`.canvas-placeholder`
			).style.height = `${height}px`
		return {
			originWidth: width,
			originHeight: height,
			width: width * devicePixelRatio,
			height: height * devicePixelRatio,
		}
	}

	/**
	 * 注册白板事件
	 * @param type
	 * @param callback
	 */
	registerEvent(type, callback) {
		const callbacks = this.callbackMap.get(type) || []
		this.callbackMap.set(type, [...callbacks, callback])
	}

	/**
	 * 注销白板事件
	 * @param type
	 * @param callback
	 */
	unregisterEvent(type, callback) {
		const callbacks = this.callbackMap.get(type) || []
		this.callbackMap.set(
			type,
			callbacks.filter((cb) => cb !== callback)
		)
	}

	/**
	 * 触发对应白板事件
	 * @param event
	 * @param params
	 */
	dispatchEvent(event, params) {
		console.log(
			'===================================触发白板事件',
			event,
			params
		)
		if (!event) {
			console.log('bug:dispatchEvent event is undefined')
			return
		}
		let callbacks = this.callbackMap.get(event)
		if (callbacks) {
			callbacks.forEach((value, index, array) => {
				value(event, params)
			})
		}
		let allCallbacks = this.callbackMap.get(this.Event.AllEvent)
		if (allCallbacks) {
			allCallbacks.forEach((value, index, array) => {
				value(event, params)
			})
		}
	}

	onEvent(eventType, params) {
		switch (eventType) {
			case 'error':
				{
					console.log(params)
				}
				break
		}
	}
	/**
	 * 白板鼠标/手指/触控板事件传递
	 * @param(event): down up move
	 * @param(source): left right stylus
	 * @param(x): 浮点数坐标的0~1
	 * @param(y):和x一样
	 * @param(f):压力0~1
	 * @param(id):目前传0和1都行
	 */
	pointerEvent(event) {
		let params
		if (event.clientX) {
			this.position.x = event.clientX / this.canvas.clientWidth
			this.position.y = event.clientY / this.canvas.clientHeight
		} else {
			if (event.touches.length) {
				this.position.x =
					event.touches[0].clientX / this.canvas.clientWidth
				this.position.y =
					event.touches[0].clientY / this.canvas.clientHeight
				this.position.force = event.touches[0].force
			}
		}

		switch (event.type) {
			case 'mousedown':
				if (![0, 2].includes(event.button)) break
				params = {
					event: 'down',
					source: event.button === 0 ? 'left' : 'right',
					x: this.position.x,
					y: this.position.y,
					f: 0.5,
					id: 1,
				}
				this.mousemove = true
				break
			case 'mousemove':
				if (![0, 2].includes(event.button)) break
				params = {
					event: 'move',
					source: event.button === 0 ? 'left' : 'right',
					x: this.position.x,
					y: this.position.y,
					f: 0.5,
					id: 1,
				}
				break
			case 'mouseup':
				if (![0, 2].includes(event.button)) break
				params = {
					event: 'up',
					source: event.button === 0 ? 'left' : 'right',
					x: this.position.x,
					y: this.position.y,
					f: 0.5,
					id: 1,
				}
				this.mousemove = false
				break
			case 'mouseout':
				if (![0, 2].includes(event.button)) break
				params = {
					event: 'up',
					source: event.button === 0 ? 'left' : 'right',
					x: this.position.x,
					y: this.position.y,
					f: 0.5,
					id: 1,
				}
				this.mousemove = false
				break
			case 'touchstart':
				params = {
					event: 'down',
					source: 'stylus',
					x: this.position.x,
					y: this.position.y,
					f: this.position.force,
					id: 1,
				}
				break
			case 'touchmove':
				params = {
					event: 'move',
					source: 'stylus',
					x: this.position.x,
					y: this.position.y,
					f: this.position.force,
					id: 1,
				}
				break
			case 'touchend':
				params = {
					event: 'up',
					source: 'stylus',
					x: this.position.x,
					y: this.position.y,
					f: this.position.force,
					id: 1,
				}
				break
		}
		console.log('传递的参数:', params)
		webAssembly.send_message({ command: `pointerEvent`, ...params }, 0)
	}
}

function get_data(command, params) {
	if (params) params = JSON.stringify(params)
	webAssembly.send_message(
		{ command: `getData`, params: { command, params } },
		0
	)
}

function push_command(command, params) {
	if (params) params = JSON.stringify(params)

	webAssembly.send_message(
		{ command: `pushCommand`, params: { command, params } },
		0
	)
}

export default new WhiteboardController()
