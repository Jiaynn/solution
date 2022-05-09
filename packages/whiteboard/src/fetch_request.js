var qs = require('qs')
//import AXIos from "axios"
// import store from "../../store"
// import screen_instance from "../screen_mask/screen_instance"
// import {*} from "/static/js/axios.min.js"

/*
let business_headers = {"Content-Type": "application/json;charset=UTF-8", "version": "1"};
let service = (headers, interface_mes) => {
  // let service = AXIos.create({headers: headers});
  let service = axios.create({headers: headers, transformResponse: data => {
    // number丢失精度转换字符串
    let losts = data.match(/":\d{17,}/g);
    if (losts) for(let i = 0; i < losts.length; i++) {
      data = data.replace(losts[i], `":"${losts[i].substr(2)}"`)
    }
    return JSON.parse(data);
  }});
  service.interceptors.response.use(response => {
    let data = response.data;
    if (data.toast) {
      let toast = data.toast, toastAdd = toast.toastAdd;
      // screen_instance.complex_message_box({
      //   img: toastAdd,
      //   report: toast,
      //   title: toast.title,
      //   showCancelButton: toast.leftBtn,
      //   cancelButtonText: toast.leftBtn ? toast.leftBtn.content : ``,
      //   confirmButtonText: toast.rightBtn ? toast.rightBtn.content : ``,
      //   message: toastAdd ? config.toast_content(toast) : toast.content,
      //   url: toast.rightBtn ? (toast.rightBtn.linkType === `server` ? `` : toast.rightBtn.linkUri) : ``
      // })
    }
    return {state: data.state, message: data.state ? (data.result === undefined ? true : data.result) : (data.message || false)};
  }, (error) => {
    console.log("axio error" + error)
    return {state: false, message: `请检查网络设置`}
  });
  return service;
};
*/

export default {
  /*
  get: (api, params, interface_mes) => {
    return new Promise((resolve, reject) => {
      service({}, interface_mes).get(api, {
        params: params,
        paramsSerializer: params => {
          return Qs && Qs.stringify(params, { indices: false });
        }
      }).then(data => {
        data.state ? resolve(data.message) : reject(data.message);
      })
    })
  },
  */
  get: (api, params, interface_mes) => {
    var url = new URL(api);
    url.search = new URLSearchParams(params);
    // console.log(api, params, interface_mes,url)
    return new Promise((resolve, reject) => {
      fetch(url,
        {
          method:"GET",
          headers: {
            // 'Content-Type': 'application/json'
            // 'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        
        })
      .then(reponse => reponse.json())
      .then(data => {
        data.state ? resolve(data.result) : reject(data);
      })
    })
  },
  post: (api, params, interface_mes, is_business) => {
//    console.log(api, params, interface_mes, is_business,service())
    // let session = store.state.session;
    console.log(api,params)
    return new Promise((resolve,reject)=>
    {
      fetch(api,
        {
          method:"POST",
          headers:{
            "Content-Type":is_business?'application/x-www-form-urlencoded':"application/json;charset=UTF-8",
          },          
          body:is_business?qs.stringify(params):JSON.stringify(params)
        })
        .then(response => response.json())
        .then(data  =>
          {
            data.state ? resolve(data.result) : reject(data);
          });
    });
  }
}
