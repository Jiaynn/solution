import ReconnectingWebSocket from 'reconnecting-websocket'

class WebSocket {
  constructor() {
    this.ping_pong = null;
    this.pageControl = {data: [], timer: null, onOff: true};
    this.onMessage = null;
    this.onConnected= null;
    this.onDisconnect = null;
    this.onError = null;
    this.retryCount = 5;
    this.closing = false;
  }
  socket_connection(vip, callback) {
    this.whiteboard_webSocket = new ReconnectingWebSocket(vip);
    this.whiteboard_webSocket.onopen = (event) => {
      callback && callback({
        status: 'open',
        event
      })
      console.log("open-----",this.whiteboard_webSocket.readyState === 1,vip)
      if(this.onConnected)
      {
        this.onConnected();
      }
      
      this.whiteboard_webSocket.send(`h&b`)
      if (this.whiteboard_webSocket.readyState === 1) {
        this.ping_pong = setInterval(() => this.whiteboard_webSocket.send(`h&b`), 30000);
      }
    };
    this.whiteboard_webSocket.onerror = function (event) {
      callback && callback({
        status: 'error',
        event
      })
      console.log("-----------------websocket.error----------------------------------");
      if(this.onError)
      {
        this.onError();
      }
    };
//    this.whiteboard_webSocket.onmessage = this.onMessage;
    this.whiteboard_webSocket.onmessage = ev => this.queue_processor(ev.data);
    this.whiteboard_webSocket.onclose = event => {
      callback && callback({
        status: 'close',
        event
      })
      console.log("websocket--close---------------------")
      clearInterval(this.ping_pong);
      if ((!this.closing) && this.retryCount -- >0) {
        // screen_instance.loading_screen(`正在重连...`, `reconnecting`);
//        app_pool.buried_point(`count`, `socket_closed`);
        this.onDisconnect();
      }
    };
  }
  reset()
  {
    this.pageControl.data = [];
    this.whiteboard_webSocket.close();

  }

  queue_processor(data) {
    console.log('-----------------------data-------------',data)
    this.onMessage(JSON.parse(data));
    /*
    this.pageControl.data.push(data);
    if (!this.pageControl.timer) {
      let num = 0;
      this.pageControl.timer = setInterval(() => {
        if (!this.pageControl.data.length && ++num === 10) {
          clearInterval(this.pageControl.timer);
          this.pageControl.timer = null;
          this.pageControl.onOff = true;
        }
        if (this.pageControl.data.length && this.pageControl.onOff) {
          if (this.overTimer) clearTimeout(this.overTimer);
          this.overTimer = setTimeout(() => {
            this.pageControl.onOff = true;
          }, 3000);
          this.pageControl.onOff = false;
//          this.data_distributor(JSON.parse(this.pageControl.data.splice(0, 1)[0]));
            this.onMessage(JSON.parse(this.pageControl.data.splice(0,1)[0]));
        }
      }, 10);
    }
    */
  }
  send_message(point, message) {
    let obj = {
      command: point,
      params: message
    };
    this.whiteboard_webSocket.send(JSON.stringify(obj));
  }

  close() {
    this.whiteboard_webSocket.close()
  }
}
export default new WebSocket();
