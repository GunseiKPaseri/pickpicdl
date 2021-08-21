// (panel<==>background)connections
const connections : {[key:string]: chrome.runtime.Port} = {};

// panel => background
chrome.runtime.onConnect.addListener((port: chrome.runtime.Port) => {
  const extensionListener = (mes: any, sender: chrome.runtime.Port) => {
    if (mes.name === 'init') {
      connections[mes.tabId] = port;
    }
    //
  };
  port.onMessage.addListener(extensionListener);
  // Delete
  port.onDisconnect.addListener((port) => {
    port.onMessage.removeListener(extensionListener);
    const tabs = Object.keys(connections);
    for (let i = 0; i< tabs.length; i++) {
      if (connections[tabs[i]] === port) {
        delete connections[tabs[i]];
        break;
      }
    }
  });
});

// contentScript => background => panel
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  // Messages from content scripts should have sender.tab set
  if (sender.tab) {
    const tabId = sender.tab.id;
    if (tabId && tabId in connections) {
      connections[tabId].postMessage(request);
    } else {
      console.log('Tab not found in connection list.');
    }
  } else {
    console.log('sender.tab not defined.');
  }
  return true;
});

