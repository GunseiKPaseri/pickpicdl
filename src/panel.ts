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

let allimglist : {[keyof: string]: Message.PicObj} = {};
let uri = '';

let imglist: {[keyof: string]: Message.PicObj} = {};

backgroundPageConnection.onMessage.addListener((message: Message.Message)=>{
  if (message.command === 'putimglist') {
    if (uri !== message.url) {
      imglist = {};
      $('#list').html('');
      uri = message.url;
    }
    imglist = Object.assign(imglist, message.imglist);
    allimglist = Object.assign(imglist, message.imglist);
    Object.entries(imglist).map(([key, val]) =>
      $('#list').append(`<li><a href='${key}'>${key}</a></li>`));
  }
});

console.log(allimglist);

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
