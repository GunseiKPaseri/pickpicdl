import $ from 'jquery';
import * as Message from './message';
import {mime2ext} from './mime2ext';

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
  new Promise<[string, string | null]>((resolve, reject)=>{
    const xhr = new XMLHttpRequest();
    xhr.onload = function() {
      const reader = new FileReader();
      reader.readAsDataURL(xhr.response);
      reader.onloadend = function() {
        resolve([
          reader.result as string,
          xhr.getResponseHeader('content-type'),
        ]);
      };
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
      $('#list').html(`
        <tr>
          <th></th><th>画像</th>><th>タイトル</th><th>getdata?</th>
        </tr>`);
      uri = message.url;
    }
    for (const key in message.imglist) {
      if (!(key in imglist)) {
        // newof
        imglist[key] = message.imglist[key];
        // getDataURL
        imglink2Base64Url(key).then(([data64, type])=>{
          imglist[key].dataURL = data64;
          const $target = $(`tr[data-href="${key}"]`);
          $target.find('img').attr('src', data64);
          $target.find('span').text('○');
          const ext = type ? mime2ext(type) : null;
          if (ext && imglist[key].filename.lastIndexOf(ext) !==
              imglist[key].filename.length - ext.length ) {
            imglist[key].filename += ext;
          }
          $target.find('input').val(imglist[key].filename ?? '');
        });
        $('#list').append(`
          <tr data-href='${key}'>
            <td>
              <input type='checkbox'>
            </td>
            <td>
              <a href='${key}' download>
                <img src='${key}'/>
              </a>
            </td>
            <td>
              <input type='text' readonly value=${imglist[key].filename}>
            </td>
            <td>
              <span>${(imglist[key].dataURL !== null ? '○' : '×')}</span>
            </td>
          </tr>`,
        );
      }
    }
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
