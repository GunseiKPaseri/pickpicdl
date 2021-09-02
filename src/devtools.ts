import browser from 'webextension-polyfill';

const backgroundPageConnection = browser.runtime.connect({
  name: 'picpickdl-devpage',
});

const execed = new Set();

const initialisePanel = ()=>{
  const tabId = browser.devtools.inspectedWindow.tabId;
  if (execed.has(tabId)) {
    backgroundPageConnection.postMessage({
      command: 'requestImgList',
      tabId: tabId,
    });
  } else {
    execed.add(tabId);
    browser.tabs.executeScript(tabId, {file: 'browser-polyfill.js'});
    browser.tabs.executeScript(tabId, {
      file: 'contentScript.js',
    }).then((result)=>{
      console.log(result);
      backgroundPageConnection.postMessage({
        command: 'requestImgList',
        tabId: tabId,
      });
    });
  }
};
const unInitialisePanel = ()=>{
  const tabId = browser.devtools.inspectedWindow.tabId;
  backgroundPageConnection.postMessage({
    command: 'removeSelector',
    tabId: tabId,
  });
};

browser.devtools.panels.create(
    '💟PicPickDL',
    'icons/icon_16.png',
    './panel.html',
).then((panel)=>{
  panel.onShown.addListener(initialisePanel);
  panel.onHidden.addListener(unInitialisePanel);
});
