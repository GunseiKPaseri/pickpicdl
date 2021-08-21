import $ from 'jquery';

console.clear();
console.log('test');


const backgroundPageConnection = chrome.runtime.connect({
  name: 'picpickdl-devpage',
});

backgroundPageConnection.postMessage({
  name: 'init',
  tabId: chrome.devtools.inspectedWindow.tabId,
});


backgroundPageConnection.onMessage.addListener((message)=>{
  if (message.command && message.command === 'putimglist') {
    const imglist = JSON.parse(message.imglist);
    imglist.map((x) => $('#list').append(`<li>${x}</li>`));
  }
});

/*
chrome.tabs.executeScript(chrome.devtools.inspectedWindow.tabId, {
  file: './contentScript.js',
}, () => {
  const port = chrome.runtime.connect({
    name: `${chrome.devtools.inspectedWindow.tabId}`,
  });

  port.onMessage.addListener((message) => {
    console.log(message);
  });
  /*
  port.postMessage({
    hoge:123
  });
});
  */


// 受信


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
