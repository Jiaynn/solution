// import OSS from "/static/js/aliyun-oss-sdk.min.js"
import tool from "./Tool.js"
// import SparkMD5 from "spark-md5"
// import html2canvas from "html2canvas"
//import command from "../enumerates/command.js"
// import file_load_step from "../enumerates/file_load_step"
// const  pdfjsLib = require("pdfjs-dist/webpack");
import controller from "./WhiteboardController.js"
import OSS from "ali-oss"

/**
 * 异步加载 script
 * @param element
 * @param url
 * @returns {*}
 */
function addScript(element, url) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    element.appendChild(script);
    script.onload = function() {
      resolve();
    }
    script.onerror = function() {
      reject();
    }
  })
}

/**
 * 防止 pdfjsLib 未加载成功报错报错
 * @param installed
 * @returns {Promise<void>|*}
 */
function runPdfJSLib(installed) {
  if (installed) {
    return Promise.resolve();
  }
  const remoteURL = 'https://docs.qnsdk.com/pdf-lib-2.6.347/';
  return addScript(document.head, remoteURL + 'pdf.js').then(() => {
    pdfjsLib.GlobalWorkerOptions.workerSrc = remoteURL + 'pdf.worker.js';
  });
}

class Download {
  constructor() {
    this.file_cache = [];
    this.to_image_queue = {queue_list: [], is_reading: false};
    this.svg_to_image_queue = {queue_list: [], is_reading: false};
    this.text_to_image_queue = {queue_list: [], is_reading: false};
    this.isPdfJSLibInstalled = false;
    // pdfjsLib.CMAP_URL = `https://unpkg.com/pdfjs-dist@2.0.943/cmaps/`;
  //  pdfLib.GlobalWorkerOptions.workerSrc = `/static/js/pdf.worker.js`;
    // pdfjsLib.GlobalWorkerOptions.workerSrc = "./bundle.js";
//    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerBlobURL;

  }
  queue_init() {
    this.to_image_queue.queue_list = [];
    this.svg_to_image_queue.queue_list = [];
    this.text_to_image_queue.queue_list = [];
    this.to_image_queue.is_reading = this.svg_to_image_queue.is_reading = this.text_to_image_queue.is_reading = false;
  }

  signatureUrl(objectName, md5, fileGroupId,superior) {
    return new Promise(resolve => {
      let cache = this.file_cache.find(item => item.objectName === objectName);
      if (cache) resolve(cache.url);
      else {
          controller.config.obtain_oss_accessKey({superior, fileGroupId,callback: accessKey => {
          let client = new OSS({
            secure: controller.config.secure,
            bucket: controller.config.ossBucket,
            endpoint: controller.config.ossEndPoint,
            // region: accessKey.region,
            stsToken: accessKey.securityToken,
            accessKeyId: accessKey.accessKeyId,
            accessKeySecret: accessKey.accessKeySecret
          });
          let objectUrl = client.signatureUrl(objectName);
          this.file_cache.push({md5: md5, objectName: objectName, url: objectUrl});
          setTimeout(() => this.file_cache.splice(this.file_cache.findIndex(item => item.url === objectUrl), 1), 1500000);
          resolve(objectUrl);
        }})
      }
    })
  }
  save_to_local(objectName, md5, superior, name) {
    this.signatureUrl(objectName, md5, superior).then(url => {
      axios.get(url, {responseType: `blob`}).then(success => {
        let blob = new Blob([success.data]), client = document.createElement(`a`);
        client.href = window.URL.createObjectURL(blob);
        client.download = name;
        client.click();
      })
    })
  }
  readFile(command, params) {
    runPdfJSLib(this.isPdfJSLibInstalled).then(() => {
      this.isPdfJSLibInstalled = true;
      switch (command) {
        case `readPDF`:
          if (this.to_image_queue.is_reading) return this.to_image_queue.queue_list.push(params);
          this.to_image_queue.is_reading = true;
          let file_cache = this.file_cache.find(item => item.local_path === params.path);
          if (file_cache) {
            // app_pool.buried_point(`count`, file_load_step.read_pdf_app, file_cache.objectName);
            this.read_write_image(file_cache, params);
          } else {
            let pdf = FS.readFile(params.path), file_cache = this.file_cache.find(item => params.path.includes(item.md5));
            if (!file_cache) {
              file_cache = {md5: params.path.split(`.`)[0], objectName: params.resourceId};
              this.file_cache.push(file_cache);
            }
            // app_pool.buried_point(`count`, file_load_step.read_pdf_system, file_cache.objectName);
            tool.read_blob(new Blob([pdf]), `readAsDataURL`, url => {
              pdfjsLib.getDocument({ url: url, cMapUrl: 'https://unpkg.com/pdfjs-dist@2.0.943/cmaps/', cMapPacked: true }).promise.then(pdf => {
                //    getDocument({ url: url, cMapUrl: this.CMAP_URL, cMapPacked: true }).promise.then(pdf => {
                // app_pool.buried_point(`count`, file_load_step.read_pdf_library, file_cache.objectName);
                file_cache.pdf = pdf;
                file_cache.local_path = params.path;
                this.read_write_image(file_cache, params);
              })
            })
          }
          break;
      }
    });
  }
  read_write_image(file_cache, params) {
    let canvas = document.createElement(`canvas`);
    file_cache.pdf.getPage(params.pageNo).then(page => {
      // app_pool.buried_point(`count`, file_load_step.read_page_library, file_cache.objectName);
      let viewport = page.getViewport({scale: 1}), desired = (params.width * params.height) ? params.width : viewport.width;
      let scaledViewport = page.getViewport({scale: desired / viewport.width});
      canvas.width = scaledViewport.width;
      canvas.height = scaledViewport.height;
      page.render({viewport: scaledViewport, canvasContext: canvas.getContext(`2d`)}).promise.then(() => {
        // app_pool.buried_point(`count`, file_load_step.conver_page_success, file_cache.objectName);
        canvas.toBlob(blob => {
          tool.read_blob(blob, `readAsArrayBuffer`, buffer => {
            FS.writeFile(`${file_cache.md5}image.jpg`, new Uint8Array(buffer));
            // app_pool.buried_point(`count`, file_load_step.write_page_success, file_cache.objectName);
            controller.read_pdf({
              command: `readPDF`,
              count: file_cache.pdf.numPages,
              originalPath: JSON.stringify(params),
              imagePath: `${file_cache.md5}image.jpg`
            });
            // app_pool.buried_point(`count`, file_load_step.notice_write_page, file_cache.objectName);
            this.to_image_queue.is_reading = false;
            let next_item = this.to_image_queue.queue_list.splice(0, 1)[0];
            if (next_item) this.readFile(`readPDF`, next_item);
          })
        }, `image/jpeg`, 1)
      })
    })
  }
  svg_to_image(svg) {
    if (this.svg_to_image_queue.is_reading) return this.svg_to_image_queue.queue_list.push(svg);
    this.svg_to_image_queue.is_reading = true;
    axios({method: "get", url: svg.url, responseType: "blob"}).then(response => {
      let img = new Image();
      img.onload = () => {
        let canvas = document.createElement("canvas"), context = canvas.getContext("2d");
        canvas.width = svg.width;
        canvas.height = svg.height;
        context.fillStyle = "rgba(0, 0, 0, 0)";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(blob => {
          tool.read_blob(blob, `readAsArrayBuffer`, buffer => {
            // let imagePath = `${SparkMD5.hash(JSON.stringify(svg))}.png`;
            // FS.writeFile(imagePath, new Uint8Array(buffer));
            // command.svg_ready({command: `svgReady`, originalParams: JSON.stringify(svg), imagePath});
            let next = this.svg_to_image_queue.queue_list.splice(0, 1)[0];
            this.svg_to_image_queue.is_reading = false;
            if (next) this.svg_to_image(next);
          })
        }, `image/png`, 1)
      }
      tool.read_blob(response.data, `readAsDataURL`, url => img.src = url);
    })
  }
  text_to_image(text, confirm) {
    if (!text) text = this.text_to_image_queue.queue_list.find(item => item.path === confirm.path).text;
    if (confirm) {
      let index = this.text_to_image_queue.queue_list.findIndex(item => item.path === confirm.path);
      if (confirm.code) {
        let deal = this.text_to_image_queue.queue_list.splice(index, 1)[0];
        controller.text_ready({command: `textReady`, originalParams: JSON.stringify(deal.text), imagePath: deal.path});
        let next_item = this.text_to_image_queue.queue_list.find(item => item.confirm && !item.confirm.code);
        if (next_item) this.text_to_image(next_item.text, next_item.confirm);
        return;
      } else this.text_to_image_queue.queue_list[index].confirm = confirm;
    } else {
      let path = `${SparkMD5.hash(JSON.stringify(text))}.png`;
      this.text_to_image_queue.queue_list.push({text, path});
      return controller.judge_file({command: `judgeFile`, path});
    }
    if (this.text_to_image_queue.is_reading) return;
    this.text_to_image_queue.is_reading = true;
    let container = document.querySelector(`#text-builder`), ratio = window.devicePixelRatio;
    container.innerText = text.text;
    container.style.cssText = `
      background-color: ${text.bgColor === `#00000000` ? `#00000000` : `#${text.bgColor.slice(3)}`};
      word-wrap: break-word; font-family: Roboto, "Source Han Sans"; padding: ${32 / ratio}px; color: #${text.textColor.slice(3)};
      width: fit-content; max-width: ${Math.ceil((text.textWidth + config.padding) / ratio)}px; font-size: ${text.fontSize / ratio}px; position: absolute; left: 10000px`;
    window.pageYoffset = document.body.scrollTop = document.documentElement.scrollTop = 0;
    html2canvas(container, {backgroundColor: `transparent`}).then(canvas => {
      canvas.toBlob(blob => {
        tool.read_blob(blob, `readAsArrayBuffer`, buffer => {
          let index = this.text_to_image_queue.queue_list.findIndex(item => item.text === text), path = this.text_to_image_queue.queue_list[index].path;
          FS.writeFile(path, new Uint8Array(buffer));
          controller.text_ready({command: `textReady`, originalParams: JSON.stringify(text), imagePath: path});
          this.text_to_image_queue.is_reading = false;
          this.text_to_image_queue.queue_list.splice(index, 1);
          let next_item = this.text_to_image_queue.queue_list.find(item => item.confirm && !item.confirm.code);
          if (next_item) this.text_to_image(next_item.text, next_item.confirm);
        })
      }, `image/png`, 1);
    })
  }
}
export default new Download();
