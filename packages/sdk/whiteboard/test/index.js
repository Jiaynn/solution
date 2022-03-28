function addScript(url, isModule) {
	let script = document.createElement('script')
	script.src = url
	if (isModule) script.type = 'module'
	document.documentElement.appendChild(script)
}

//建立一个全局对象Module，用来初始化webassembly
window.Module = {}

//七牛测试服务器

//下面的信息为进入房间的认证信息，由服务器端生成
//当前程序的appId
let appId = 'a4b26ecae3744e3fb60ff679e186cd98'
//要加入房间的meetingId
let meetingId = '93819b26e87a484fb2b5dc311e36803e'
// let meetingId = "00566d23fb0a4904a7fa1e085eab7b10";
//用户信息
let userId = 'test'
//加入房间所需要的token
let token = '76c159f30998f50d17554ba98ba4d93c'
let url = 'https://api.latitech.com:8888/Chatboard/meeting/join'

//北纬测试服务器
//for sdktest
/*
let token =  "127182d9a297292558aa3d935746827c"; 
let appId =  "a4b26ecae3744e3fb60ff679e186cd98";
let meetingId = "0f9ce36096bb4330bdee6ca9acd6b89f";
let userId = "07345de7-5a80-48d4-86fd-d75635525d7d";
let url = `https://sdktest.efaceboard.cn:8888/Chatboard/meeting/join`;
*/

//初始化白板
whiteboard.controller.initialize(url)
// 挂载canvas
whiteboard.controller.mountCanvas('canvasBox')
//注册白板的事件回调函数
whiteboard.controller.registerEvent(
	whiteboard.controller.Event.AllEvent,
	processEvent
)

//加载webassembly代码
addScript('./whiteboard_webassembly.js', false)
addScript('./ui.js')

//加入房间
whiteboard.controller.join_room(appId, meetingId, userId, token, (status) => {
	console.log('join_room status', status)
})

//处理白板和房间事件
function processEvent(event, params) {
	console.log(
		'=========================processEvent',
		event,
		params,
		whiteboard.controller.Event
	)
	switch (event) {
		case whiteboard.controller.Event.AllEvent:
			break
		case whiteboard.controller.Event.PageListChanged:
			GlobalMethod.createPage(params)
			break
		case whiteboard.controller.Event.PageChanged:
			break
		case whiteboard.controller.Event.WebassemblyReady:
			break
		case whiteboard.controller.Event.WhiteboardSizeChanged:
			break
		case whiteboard.controller.Event.JoinRoomError:
			break
		case whiteboard.controller.Event.DocumentChange:
			console.log(
				'document size:',
				whiteboard.controller.documentWidth,
				whiteboard.controller.documentHeight
			)
			GlobalMethod.documentChange(event, params)
			break
		case whiteboard.controller.Event.BackgroundChange:
			console.log('修改背景色为：', params)
			GlobalMethod.setBackgroundColor(params)
			console.log(GlobalMethod.documents)
			break
		case whiteboard.controller.Event.WidgetActivity:
			GlobalMethod.widgetActivity(event, params)
			break
		case whiteboard.controller.Event.FileFlip:
			break
		case whiteboard.controller.Event.RecoveryState:
			console.log('RecoveryState', params)
			if (params.notEmpty)
				document.querySelector('.rubber-undo').style.display = 'block'
			break
		case whiteboard.controller.Event.WidgetAction:
			break
		case whiteboard.controller.WhiteboardSizeChanged:
			console.log('size changed:', params)
			break
		case whiteboard.controller.WidgetScroll:
			console.log('scroll event', params)
			break
	}
}

document.getElementById('setbgred').addEventListener('click', function () {
	whiteboard.controller.set_whiteboard_back('#FFFFFFFF')
})

document.getElementById('leave').addEventListener('click', function () {
	whiteboard.controller.leave_room()
})

document.getElementById('join').addEventListener('click', function () {
	whiteboard.controller.join_room(appId, meetingId, userId, token)
})

document.getElementById('mount').addEventListener('click', function () {
	whiteboard.controller.mountCanvas('canvasBox')
})

document.getElementById('unload').addEventListener('click', function () {
	whiteboard.controller.unloadCanvs()
})

document.getElementById('setCanvasBtn').addEventListener('click', () => {
	setCanvas()
})

function setCanvas() {
	const canvas = document.querySelector('#canvas')
	console.log('canvas', canvas)
	console.log('document.body.clientWidth', document.body.clientWidth)
	console.log('document.body.clientHeight', document.body.clientHeight)
	canvas.style.width = `${document.body.clientWidth}px`
	canvas.style.height = `${document.body.clientHeight}px`
	let devicePixelRatio = window.devicePixelRatio
	let width = document.body.clientWidth
	let height = document.body.clientHeight
	canvas.width = width * window.devicePixelRatio
	canvas.height = height * window.devicePixelRatio

	console.log('resize to ', width, height)
	whiteboard.controller.update_canvas_size({
		originWidth: width,
		originHeight: height,
		height: height * devicePixelRatio,
		width: width * devicePixelRatio,
	})
}
