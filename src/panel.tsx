import * as React from 'react';
import * as ReactDOM from 'react-dom';

import {createTheme, ThemeProvider} from '@material-ui/core';

import {Provider, useSelector} from 'react-redux';
import {
  getAddBadURIsAction,
  getAddItemsAction,
  getSetUrlAction,
  initialState,
  reducer,
  rootSaga,
  State,
} from './redux';
import App from './components/App';
import {Message, PicObj, PicObjWithBlob} from './type';
import {imglink2Blob} from './util/blobutil';
import {mime2ext} from './util/mime2ext';
import {applyMiddleware, createStore, compose} from 'redux';
import createSaga from 'redux-saga';
import {browser} from 'webextension-polyfill-ts';

console.clear();

const backgroundPageConnection = browser.runtime.connect({
  name: 'picpickdl-devpage',
});
backgroundPageConnection.postMessage({
  command: 'init',
  tabId: browser.devtools.inspectedWindow.tabId,
});

// use saga
const saga = createSaga();

// define store
// const composeEnhancers = composeWithDevTools({realtime: true, port: 8000});
const store =
  createStore(reducer, initialState, compose(applyMiddleware(saga)));
saga.run(rootSaga);

backgroundPageConnection.onMessage.addListener((message: Message)=>{
  if (message.command === 'putimglist') {
    if (store.getState().url !== message.url) {
      store.dispatch(getSetUrlAction(message.url));
    }
    const additionItem = Object.entries(message.imglist)
        .flatMap(([uriEntry, item]): [string, PicObj][]=>{
          if (store.getState().baduri.has(uriEntry) ||
              (uriEntry in store.getState().items)) return [];
          return [[uriEntry, item]];
        });
    const promises = additionItem
        .map(([uriEntry, item])=> imglink2Blob(uriEntry).then((blob)=>{
          const ext = mime2ext(blob.type);
          if (!ext) return ['bad', uriEntry];
          const newItem:PicObjWithBlob =
            {...item, blob, filesize: blob.size};
          return newItem;
        }));
    Promise.all(promises).then((results)=>{
      const newItems = results.flatMap((x)=> Array.isArray(x) ? [] : [x]);
      const badURIs = results.flatMap((x)=> Array.isArray(x) ? [x[1]] : []);
      store.dispatch(getAddItemsAction(newItems));
      store.dispatch(getAddBadURIsAction(badURIs));
    });
  }
});

export const selectElementCommand = (selector: string)=> {
  backgroundPageConnection.postMessage({
    command: 'selectDOMElement',
    selector,
    tabId: browser.devtools.inspectedWindow.tabId,
  });
};

// Render

const AppWithTheme = () => {
  const themetype = useSelector<State, 'dark'|'light'>(
      (state)=>state.themetype);
  const theme = createTheme({
    palette: {
      type: themetype,
    },
  });
  return (
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  );
};

const Root = () => {
  return (
    <Provider store={store}>
      <AppWithTheme />
    </Provider>
  );
};


ReactDOM.render(<Root />, document.querySelector('#app'));

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
