// import { tabs } from "webextension-polyfill";

const backgroundPageConnection = chrome.runtime.connect({
  name: 'picpickdl-devpage',
});

const initialisePanel = ()=>{
  const tabId = chrome.devtools.inspectedWindow.tabId;
  chrome.tabs.executeScript(tabId, {
    file: 'contentScript.js',
  }, (result)=>{
    console.log(result);
    backgroundPageConnection.postMessage({
      command: 'requestImgList',
      tabId: tabId,
    });
  });
};

chrome.devtools.panels.create(
    'PicPickDL',
    'icons/icon_16.png',
    './panel.html',
    (panel)=>{
      panel.onShown.addListener(initialisePanel);
      // panel.onHidden.addListener(unInitialisePanel);
    });
