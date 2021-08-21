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


backgroundPageConnection.onMessage.addListener((message: Message.Message)=>{
  if (message.command === 'putimglist') {
    const imglist = message.imglist;
    imglist.map((x) => $('#list').append(`<li>${x}</li>`));
  }
});

/*
//なんで動かねぇ
chrome.devtools.network.onNavigated.addListener((url) => {
  console.log(url);
});

chrome.devtools.network.onRequestFinished.addListener((req) => {
  const url = req.request.url;
  console.log(url)
  if (url.indexOf("twitter") !== -1) {
    console.log(`req:${JSON.stringify(req)}`); // ついでに、requestの内容をconsoleに表示
  }
});
*/
