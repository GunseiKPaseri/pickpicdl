import $ from 'jquery';
import * as Message from './message';

console.clear();
console.log('test');


const backgroundPageConnection = chrome.runtime.connect({
  name: 'picpickdl-devpage',
});

backgroundPageConnection.postMessage({
  command: 'init',
  tabId: chrome.devtools.inspectedWindow.tabId,
});


const imglink2Base64Url = (url: string ) =>
  new Promise<string|ArrayBuffer|null>((resolve, reject)=>{
    const xhr = new XMLHttpRequest();
    xhr.onload = function() {
      const reader = new FileReader();
      reader.onloadend = function() {
        resolve(reader.result);
      };
      reader.readAsDataURL(xhr.response);
    };
    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.send();
  });


let uri = '';

let imglist: {[keyof: string]: Message.PicObj} = {};

backgroundPageConnection.onMessage.addListener((message: Message.Message)=>{
  if (message.command === 'putimglist') {
    if (uri !== message.url) {
      imglist = {};
      $('#list').html('');
      uri = message.url;
    }
    for (const key in message.imglist) {
      if (!(key in imglist)) {
        // newof
        console.log(key);
        imglist[key] = message.imglist[key];
        // getDataURL
        imglink2Base64Url(key).then((data64)=>{
          console.log(data64);
          if (typeof data64 === 'string') {
            imglist[key].dataURL = data64;
          }
        });
      }
    }
    Object.entries(imglist).map(([key, val]) =>
      $('#list').append(
          `<li><a href='${key}' download>
          <img src='${key}' height='200' /></a>${val.dataURL}</li>`,
      ));
  }
});


/*
// なんで動かねぇ
chrome.devtools.network.onNavigated.addListener((url) => {
  console.log(url);
});

chrome.devtools.network.onRequestFinished.addListener((req) => {
  const url = req.request.url;
  console.log(url);
});
*/
