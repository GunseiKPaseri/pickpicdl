const backgroundPageConnection = chrome.runtime.connect({
  name: 'picpickdl-devpage',
});

const initialisePanel = ()=>{
  backgroundPageConnection.postMessage({
    command: 'requestImgList',
    tabId: chrome.devtools.inspectedWindow.tabId,
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
