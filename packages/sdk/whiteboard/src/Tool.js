// import pako from "../node_modules/pako/index.js"
const  pako  =  require ('pako');
import SparkMD5 from "spark-md5"


export default class Tool {
  constructor() {

  }
//数据解压缩
  static unzip(data) {
    if (data === ``) return `{}`;
    let charData = atob(data).split(``).map(x => {
      return x.charCodeAt(0);
    }), information = ``;
    charData.splice(0, 4);
    let binData = new Uint8Array(charData); data = new Uint16Array(pako.inflate(binData));
    for(let fragment of charData) information += String.fromCharCode(fragment);
    return pako.ungzip(information, { to: `string` });
  }
//数据压缩
  static zip(str) {
    let binaryString = pako.gzip(str, { to: `string` });
    binaryString = String.fromCharCode.apply(null, new Uint8Array(intToBytes(this.stringToBytes(str).length))) + binaryString;
    return btoa(binaryString);
    function intToBytes(value) {
      let src = [];
      src[3] = ((value>>24) & 0xFF);
      src[2] = ((value>>16) & 0xFF);
      src[1] = ((value>>8) & 0xFF);
      src[0] = (value & 0xFF);
      return src;
    }
  }
//时间格式处理函数
  static get_date(date) {
    date = new Date(date);
    let week, year = date.getFullYear(), month = date.getMonth() + 1;  
    let day = date.getDate(), hours = date.getHours(), minutes = date.getMinutes();
    switch (date.getDay()) {
      case 0: week = `周日`;
        break;
      case 1: week = `周一`;
        break;
      case 2: week = `周二`;
        break;
      case 3: week = `周三`;
        break;
      case 4: week = `周四`;
        break;
      case 5: week = `周五`;
        break;
      case 6: week = `周六`;
        break;
    }
    return {
      week: week,
      year: year,
      day: day < 10 ? `0${day}` : day,
      hour: hours < 10 ? `0${hours}` : hours,
      month: month < 10 ? `0${month}` : month,
      minute: minutes < 10 ? `0${minutes}` : minutes,
    }
  }
  static get_record_time(time) {
    let parsing = this.get_date(time);
    return `${parsing.month}月${parsing.day}日 ${parsing.week} ${parsing.hour}:${parsing.minute}`;
  }
  static get_schedule_time(start, end, end_date) {
    if (end_date) {
      if (end_date === -1) return `未设置结课日期`;
      end_date = this.get_date(end_date);
      return `${end_date.year}-${end_date.month}-${end_date.day}`;
    }
    start = this.get_date(start), end = this.get_date(end);
    return `${start.year}-${start.month}-${start.day} (${start.week}) ${start.hour}:${start.minute} - ${end.hour}:${end.minute}`;
  }
  static getUpdateTime(timestamp) {
    let curTimestamp = new Date().getTime(), timestampDiff = (curTimestamp - timestamp) / 1000;
    let tmDate = new Date(timestamp), curDate = new Date(curTimestamp);
    let Y = tmDate.getFullYear(), M = tmDate.getMonth() + 1, D = tmDate.getDate(), H = tmDate.getHours(), I = tmDate.getMinutes();
    if (timestampDiff < 60) return `刚刚`;
    if (timestampDiff < 3600) return `${Math.floor(timestampDiff / 60)}分钟前`;
    if (curDate.getFullYear() === Y && curDate.getMonth() + 1 === M && curDate.getDate() === D) {
      return `${this.add_zero(H)}：${this.add_zero(I)}`;
    }
    let newDate = new Date((curTimestamp - 86400 * 1000));
    if (newDate.getFullYear() === Y && newDate.getMonth() + 1 === M && newDate.getDate() === D) return `昨天`;
    if (curDate.getFullYear() === Y) return `${this.add_zero(M)}月${this.add_zero(D)}日`;
    return `${Y}年${this.add_zero(M)}月${this.add_zero(D)}日`;
  }
  static getChatTime(curTimestamp, timestamp) {
    let curDate = new Date(curTimestamp), timestampDiff = (curTimestamp - timestamp) / 1000;
    if (timestampDiff < 180) return null;
    return `${this.add_zero(curDate.getHours())}：${this.add_zero(curDate.getMinutes())}`;
  }
  static getUseTime(remain) {
    return `${this.add_zero(parseInt(remain/60/60%24))}:${this.add_zero(parseInt(remain/60%60))}:${this.add_zero(parseInt(remain%60))}`;
  }
  static getCurrentTime(input_time, is_start) {
    let time = input_time ? new Date(input_time) : new Date();
    if (is_start) return `${this.add_zero(time.getMonth() + 1)}月${this.add_zero(time.getDate())}日 ${this.add_zero(time.getHours())}:${this.add_zero(time.getMinutes())}`;
    return `${this.add_zero(time.getMonth() + 1)}-${this.add_zero(time.getDate())} ${this.add_zero(time.getHours())}:${this.add_zero(time.getMinutes())}`;
  }
  static slider_time(time) {
    time = time / 1000;
    return time > 60 ? `${this.add_zero(Math.floor(time / 60))} : ${this.add_zero(time % 60)}` : `00 : ${this.add_zero(Math.floor(time))}`;
  }
  static duration_time(duration) {
    duration = Math.floor(duration / 1000);
    if (duration < 60) return `${duration} 秒`;
    if (duration < 3600) {
      let remainder = duration % 60, minute = Math.floor(duration / 60);
      return remainder ? `${minute} 分钟 ${remainder} 秒` : `${minute} 分钟`;
    }
    let residue_minute = duration % 3600, residue_second = residue_minute % 60, show_minute = Math.floor(residue_minute / 60);
    return `${Math.floor(duration / 3600)} 小时${show_minute ? ` ${show_minute} 分钟` : ``}${residue_second ? ` ${residue_second} 秒` : ``}`;
  }
// 不满两位补零
  static add_zero(num) {
    num = parseInt(num);
    return num < 10 ? `0${num}` : num;
  }
// 生成UUID
  static generateUUID() {
    let d = Date.now();
    if (window.performance && typeof window.performance.now === `function`) d += performance.now();
    return `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`.replace(/[xy]/g, c => {
      let r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c === `x` ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }
// 设备类型判断
  static get_device() {
    let sUserAgent = navigator.userAgent, ua = sUserAgent.toLowerCase(),
      isAndroid = /(?:Android)/.test(sUserAgent), isFireFox = /(?:Firefox)/.test(sUserAgent),
      isTablet = /(?:iPad|PlayBook)/.test(sUserAgent) || (isAndroid && !/(?:Mobile)/.test(sUserAgent))
        || (isFireFox && /(?:Tablet)/.test(sUserAgent)), isSymBanOS = /(?:SymbianOS)/.test(sUserAgent),
      isWindowsPhone = /(?:Windows Phone)/.test(sUserAgent), isPhone = /(?:iPhone)/.test(sUserAgent) && !isTablet;
    return {
      system: detectOS(),
      device: sUserAgent,
      isFireFox: isFireFox,
      isPhone: isPhone, //苹果
      isSymBanOS: isSymBanOS, //班赛
      isTablet: isTablet, //平板
      isAndroid: isAndroid, //安卓
      isWindowsPhone: isWindowsPhone, //微软手机
      isChrome: /(?:Chrome|CriOS)/.test(sUserAgent),
      isMobile: isWindowsPhone || isSymBanOS || isAndroid || isPhone,
      isWX: ua.includes(`micromessenger`),
      isQQ: sUserAgent.includes(`MQQBrowser`) && !Boolean(ua.match(/QQ/i)),
      isQQInstalled: Boolean(ua.match(/QQ/i)) && !sUserAgent.includes(`MQQBrowser`),
      is_x5_kernel: ua.includes(`micromessenger`) || sUserAgent.includes(`MQQBrowser`) || Boolean(ua.match(/QQ/i))
    };
    function detectOS() {
      let sPlatForm = navigator.platform, isWin = (sPlatForm === "Win32") || (sPlatForm === "Windows"),
        isMac = (sPlatForm === "Mac68K") || (sPlatForm === "MacPPC") || (sPlatForm === "Macintosh") || (sPlatForm === "MacIntel");
      if (isMac) return "Mac";
      if (sPlatForm.includes("Linux")) return "Linux";
      if ((sPlatForm === "X11") && !isWin && !isMac) return "Unix";
      if (isWin) {
        if (sUserAgent.includes("Windows NT 5.0") || sUserAgent.includes("Windows 2000")) return "Win2000";
        if (sUserAgent.includes("Windows NT 5.1") || sUserAgent.includes("Windows XP")) return "WinXP";
        if (sUserAgent.includes("Windows NT 5.2") || sUserAgent.includes("Windows 2003")) return "Win2003";
        if (sUserAgent.includes("Windows NT 6.0") || sUserAgent.includes("Windows Vista")) return "WinVista";
        if (sUserAgent.includes("Windows NT 6.1") || sUserAgent.includes("Windows 7")) return "Win7";
        if (sUserAgent.includes("Windows NT 8.0") || sUserAgent.includes("Windows 8")) return "Win8";
        if (sUserAgent.includes("Windows NT 10.0") || sUserAgent.includes("Windows 10")) return "Win10";
      }
      return "未知操作系统";
    }
  }
// 腾讯音视频 demo 设备及浏览器信息提取
  static get_agent() {
    let pc = true;
    // 判断是否是移动设备
    const userAgentInfo = navigator.userAgent, Agents = new Array('Android', 'iPhone', 'SymbianOS', 'Windows Phone', 'iPad', 'iPod');
    if (Agents.find(item => userAgentInfo.includes(item))) pc = false;
    // 获取浏览器内核及版本
    let sys = {}, s;
    const ua = navigator.userAgent.toLowerCase();
    (s = ua.match(/edge\/([\d.]+)/)) ? sys.edge = s[1] :
    (s = ua.match(/rv:([\d.]+)\) like gecko/)) ? sys.ie = s[1] :
    (s = ua.match(/msie ([\d.]+)/)) ? sys.ie = s[1] :
    (s = ua.match(/firefox\/([\d.]+)/)) ? sys.firefox = s[1] :
    (s = ua.match(/chrome\/([\d.]+)/)) ? sys.chrome = s[1] :
    (s = ua.match(/opera.([\d.]+)/)) ? sys.opera = s[1] :
    (s = ua.match(/version\/([\d.]+).*safari/)) ? sys.safari = s[1] : 0;
    if (sys.ie) return { broswer : "IE", version : sys.ie, pc };
    if (sys.edge) return { broswer : "Edge", version : sys.edge, pc };
    if (sys.opera) return { broswer : "Opera", version : sys.opera, pc };
    if (sys.safari) return { broswer : "Safari", version : sys.safari, pc };
    if (sys.chrome) return { broswer : "Chrome", version : sys.chrome, pc };
    if (sys.firefox) return { broswer : "Firefox", version : sys.firefox, pc };
    return { broswer : "", version : 0, pc };
  }
// 提取地址栏信息
  static handle_href() {
    let list = location.href.split(`?`);
    if (list.length === 1) return null;
    let is_teacher = location.href.includes(`activity_7`), is_course = location.href.includes(`activity_9`);
    let obj = {teacher_mes: {}, course_mes: {}}, search_list = decodeURIComponent(list[list.length - 1]).split(`&`);
    for(let item of search_list) {
      let arr = item.split(`=`);
      if (is_teacher) obj[`teacher_mes`][arr[0]] = arr[1];
      else if (is_course) obj[`course_mes`][arr[0]] = arr[1];
      else obj[arr[0]] = arr[1];
    }
    return obj;
  }
// 手机号、邮件格式检测
  static isMobile(str) {
    // return /^1[123456789]\d{9}$/.test(str);
    return String(str).length === 11;
  }
  static isEmail(str) {
    return /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/.test(str);
  }
// 字符串转字节数组
  static stringToBytes(str) {
    let bytes = [], c;
    for(let i = 0; i < str.length; i++) {
      c = str.charCodeAt(i);
      if (c >= 0x010000 && c <= 0x10FFFF) {
        bytes.push(((c >> 18) & 0x07) | 0xF0);
        bytes.push(((c >> 12) & 0x3F) | 0x80);
        bytes.push(((c >> 6) & 0x3F) | 0x80);
        bytes.push((c & 0x3F) | 0x80);
      } else if (c >= 0x000800 && c <= 0x00FFFF) {
        bytes.push(((c >> 12) & 0x0F) | 0xE0);
        bytes.push(((c >> 6) & 0x3F) | 0x80);
        bytes.push((c & 0x3F) | 0x80);
      } else if (c >= 0x000080 && c <= 0x0007FF) {
        bytes.push(((c >> 6) & 0x1F) | 0xC0);
        bytes.push((c & 0x3F) | 0x80);
      } else {
        bytes.push(c & 0xFF);
      }
    }
    return bytes;
  }
// 字节数组转字符串
  static bytesToString(bytes) {
    let str = ``;
    for(let i = 0; i < bytes.length; i++) {
      let one = bytes[i].toString(2), v = one.match(/^1+?(?=0)/);
      if (v && one.length === 8) {
        let bytesLength = v[0].length, store = bytes[i].toString(2).slice(7 - bytesLength);
        for(let st = 1; st < bytesLength; st++) {
          store += bytes[st + i].toString(2).slice(2);
        }
        str += String.fromCharCode(parseInt(store, 2));
        i += bytesLength - 1;
      } else {
        str += String.fromCharCode(bytes[i]);
      }
    }
    return str;
  }
// utf16转utf8
  static utf16to8(str) {
    let out = ``, i, len = str.length, c;
    for(i = 0; i < len; i++) {
      c = str.charCodeAt(i);
      if ((c >= 0x0001) && (c <= 0x007F)) {
        out += str.charAt(i);
      } else if (c > 0x07FF) {
        out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F));
        out += String.fromCharCode(0x80 | ((c >> 6) & 0x3F));
        out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
      } else {
        out += String.fromCharCode(0xC0 | ((c >> 6) & 0x1F));
        out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
      }
    }
    return out;
  }
// utf8转utf16
  static utf8to16(str) {
    let out = ``, i = 0, len = str.length, c, char2, char3;
    while(i < len) {
      c = str.charCodeAt(i++);
      switch(c >> 4) {
        case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
        out += str.charAt(i-1);
        break;
        case 12: case 13:
        char2 = str.charCodeAt(i++);
        out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
        break;
        case 14:
          char2 = str.charCodeAt(i++);
          char3 = str.charCodeAt(i++);
          out += String.fromCharCode(((c & 0x0F) << 12) | ((char2 & 0x3F) << 6) | ((char3 & 0x3F) << 0));
          break;
      }
    }
    return out;
  }
// 将数据写入内存地址
  static writeString(str, offset) {
    const strBuf = new TextEncoder().encode(str);
    const outBuf = new Uint8Array(wasmMemory.buffer, offset, strBuf.length);
    for(let i = 0; i < strBuf.length; i++) outBuf[i] = strBuf[i];
  }
// 白板功能开关处理
  static feature_status(single, status) {
    return Boolean(single & status);
  }
// 会议状态处理
  static meeting_status(status) {
    return Boolean(status & this.status);
  }
// 权限状态处理
  static privilege_operation(privilege, offset) {
    return (3 << offset & privilege) >>> offset;
  }
  static privilege_change(mes, type) {
    if (type === `low`) {
      return this.globalPrivilege_num & mes.andLowerPrivilege | mes.orLowerPrivilege;
    } else {
      return this.high_globalPrivilege_num & mes.andHighPrivilege | mes.orHighPrivilege;
    }
  }
  static determine_available(offset) {
    let real_offset = offset > 30 ? offset - 32 : offset;
    let real_privilege_num = offset > 30 ? this.high_privilege_num : this.privilege_num;
    let real_globalPrivilege_num = offset > 30 ? this.high_globalPrivilege_num : this.globalPrivilege_num;
    let privilegeState = this.privilege_operation(real_privilege_num, real_offset);
    let globalState = this.privilege_operation(real_globalPrivilege_num, real_offset);
    if (offset === 22) {
      if (globalState === 0 || globalState === 3) return { onOff: false, status: `before` };
      return { onOff: true, status: globalState === 2 && privilegeState === 1 ? `processing` : `before`};
    }
    if (globalState === 3) return true;
    return globalState === 2 && privilegeState === 3;
  }
  
  static get_raise_state(user, offset) {
    return this.privilege_operation(user.lowerPrivilege, offset);
  }
  static obtain_authority(unit, offset) {
    let global = unit[offset > 30 ? `highGlobalPrivilege` : `lowerGlobalPrivilege`], privilege = unit[offset > 30 ? `highPrivilege` : `lowerPrivilege`];
    offset = offset > 30 ? offset - 32 : offset;
    let p_global = global ? this.privilege_operation(global, offset) : 2, p_privilege = this.privilege_operation(privilege, offset);
    return p_global === 3 || (p_global === 2 && p_privilege === 3);
  }
  static get_low_pageNo(num) {
    return (num % 20 > 0) ? Math.ceil(num / 20) : (Math.ceil(num / 20) + 1);
  }
// 文件类型检测
  static file_supported(path) {
    let lower = path.toLowerCase();
    let get_type = () => {
      switch (true) {
        case lower.includes(`.pdf`):
          return 1;
        case lower.includes(`.doc`) || lower.includes(`.docx`):
          return 2;
        case lower.includes(`.xls`) || lower.includes(`.xlsx`):
          return 3;
        case lower.includes(`.ppt`) || lower.includes(`.pptx`):
          return 4;
        case lower.includes(`.png`) || lower.includes(`.jpg`) || lower.includes(`.jpeg`):
          return 0;
        default:
          return false;
      }
    }, file_type = get_type();
    if (file_type === false) return {is_support: false};
    else {
      let list = path.split(`.`);
      return {
        is_support: true,
        file_type: file_type,
        extension: list[list.length - 1]
      }
    }
    // let mime_type = {
    //   ".png" : "image/png",
    //   ".jpg" : "image/jpeg",
    //   ".jpeg" : "image/jpeg",
    //   ".pdf" : "application/pdf",
    //   ".doc" : "application/msword",
    //   ".xls" : "application/vnd.ms-excel",
    //   ".ppt" : "application/vnd.ms-powerpoint",
    //   ".xlsx" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    //   ".docx" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    //   ".pptx" : "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    // };
  }
// 图片尺寸处理
  static image_processing(file, callback) {
    let reader = new FileReader(), image = new Image();
    reader.onload = e => image.src = e.target.result;
    image.onload = function() {
      let originWidth = this.width, originHeight = this.height, targetWidth = originWidth, targetHeight = originHeight;
      let maxWidth = originWidth < originHeight ? 1080 : 1920, maxHeight = originWidth < originHeight ? 1920 : 1080;
      if (originWidth > maxWidth) {
        targetWidth = maxWidth;
        targetHeight = Math.round(maxWidth * (originHeight / originWidth));
      }
      if (originHeight > maxHeight) {
        targetHeight = maxHeight;
        targetWidth = Math.round(maxHeight * (originWidth / originHeight));
      }
      if (targetWidth === originWidth && targetHeight === originHeight) return callback(file);
      let canvas = document.createElement(`canvas`), context = canvas.getContext(`2d`);
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      context.clearRect(0, 0, targetWidth, targetHeight);
      context.drawImage(image, 0, 0, targetWidth, targetHeight);
      canvas.toBlob(blob => callback(blob), file.type || `image/png`);
    };
    reader.readAsDataURL(file);
  }
// 读取blob文件
  static read_blob(blob, type, callback) {
    let reader = new FileReader();
    reader.onload = () => callback(reader.result);
    switch (type) {
      case `readAsArrayBuffer`:
        reader.readAsArrayBuffer(blob);
        break;
      case `readAsDataURL`:
        reader.readAsDataURL(blob, {type: "application/pdf"});
        break;
    }
  }
// 读取文件md5
  static spark_md5(file, callBack) {
    let blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice, chunkSize = 8097152,
      chunks = Math.ceil(file.size / chunkSize), currentChunk = 0, spark = new SparkMD5.ArrayBuffer(), fileReader = new FileReader();
    fileReader.onload = e => {
      spark.append(e.target.result);
      currentChunk ++;
      if (currentChunk < chunks) loadNext();
      else callBack(spark.end());
    };
    fileReader.onerror = () => {
      console.warn(`oops, something went wrong.`);
    };
    function loadNext() {
      let start = currentChunk * chunkSize, end = ((start + chunkSize) >= file.size) ? file.size : start + chunkSize;
      fileReader.readAsArrayBuffer(blobSlice.call(file, start, end));
    }
    loadNext();
  }
// 课程详情数据装配
  static get_nodeEnv_details(raw) {
    raw.tags = raw.tags || [];
    raw.eventRules = raw.eventRules || [];
    raw.members.assistant = raw.members.assistant || [];
    let inviteCode = raw.inviteCode.inviteCode;
    raw.inviteCode_view = `${inviteCode.slice(0, 3)}-${inviteCode.slice(3, 6)}-${inviteCode.slice(6, 9)}`;
    return raw;
  }
}
