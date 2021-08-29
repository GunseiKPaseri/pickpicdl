import * as Message from './type';
import browser from 'webextension-polyfill';
// (panel<==>background)connections
const connections : {[key:string]: browser.Runtime.Port} = {};

// panel => background => contentScript
browser.runtime.onConnect.addListener((port: browser.Runtime.Port) => {
  const extensionListener =
    (mes: Message.Message, sender: browser.Runtime.Port) => {
      if (mes.command === 'init') {
        // panel => background
        connections[mes.tabId] = port;
      } else if ('tabId' in mes ) {
        // panel => background => contentScript (NEED tabId)
        browser.tabs.sendMessage(mes.tabId, mes);
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
browser.runtime.onMessage.addListener((request, sender) => {
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
});

