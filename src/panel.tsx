import * as React from 'react';
import * as ReactDOM from 'react-dom';

import {createTheme, ThemeProvider} from '@material-ui/core';

import {Provider} from 'react-redux';
import {
  getAddBadURIsAction,
  getAddItemsAction,
  getSetUrlAction,
  initialState,
  reducer,
  rootSaga,
} from './redux';
import App from './components/App';
import {Message, PicObj, PicObjWithBlob} from './type';
import {imglink2Blob} from './util/blobutil';
import {mime2ext} from './util/mime2ext';
import {applyMiddleware, createStore, compose} from 'redux';
import createSaga from 'redux-saga';

console.clear();

const backgroundPageConnection = chrome.runtime.connect({
  name: 'picpickdl-devpage',
});
backgroundPageConnection.postMessage({
  command: 'init',
  tabId: chrome.devtools.inspectedWindow.tabId,
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

    /*
    for (const uriEntry in message.imglist) {
      if (!store.getState().baduri.has(uriEntry) &&
        !(uriEntry in store.getState().items)) {
        console.log(uriEntry);
        const item = message.imglist[uriEntry];
        imglink2Blob(uriEntry).then((blob)=>{
          const ext = mime2ext(blob.type);
          if (!ext) {
            store.dispatch(getAddBadURIAction(uriEntry));
            return [];
          }
          if (hasExt(item.filename, ext)) {
            item.filename = item.filename + ext;
          }
          return [{...item, blob, filesize: blob.size}];
          store.dispatch(getAddItemAction(newItem));
        }).flatMap().;
        // newof
        imglist[key] = message.imglist[key];
        // getDataURL
        imglink2Blob(key).then((blob)=>{
          imglist[key].blob = blob;
          const $target = $(`tr[data-href="${key}"]`);
          $target.find('span').text(blob.size);
          const ext = mime2ext(blob.type);
          if (!ext) {
            // bad file
            delete imglist[key];
            $target.remove();
            return;
          }
          if (ext && hasExt(imglist[key].filename, ext) ) {
            imglist[key].filename += ext;
          }
          $target.find('a').attr('download', imglist[key].filename);
          $target.find('input').val(imglist[key].filename);
        });
        const blob = imglist[key].blob;

        $('#list').append(`
          <tr data-href='${key}'>
            <td>
              <input class='imgchk' type='checkbox'>
            </td>
            <td>
              <a href='${key}' download=${imglist[key].filename}>
                <img src='${key}'/>
              </a>
            </td>
            <td>
              <input type='text' readonly value=${imglist[key].filename}>
            </td>
            <td>
              ${imglist[key].from}
            </td>
            <td>
              <span>${blob ? blob : '?'}</span>
            </td>
          </tr>`,
        );
      }
    }*/
  }
});
/*

backgroundPageConnection.onMessage.addListener((message: Message.Message)=>{
  if (message.command === 'putimglist') {
    if (uri !== message.url) {
      imglist = {};
      $('#list').html(`
        <tr>
          <th></th><th>画像</th><th>タイトル</th><th>from</th><th>サイズ</th>
        </tr>`);
      uri = message.url;
    }
    for (const key in message.imglist) {
      if (!(key in imglist)) {
        // newof
        imglist[key] = message.imglist[key];
        // getDataURL
        imglink2Blob(key).then((blob)=>{
          imglist[key].blob = blob;
          const $target = $(`tr[data-href="${key}"]`);
          $target.find('span').text(blob.size);
          const ext = mime2ext(blob.type);
          if (!ext) {
            // bad file
            delete imglist[key];
            $target.remove();
            return;
          }
          if (ext && hasExt(imglist[key].filename, ext) ) {
            imglist[key].filename += ext;
          }
          $target.find('a').attr('download', imglist[key].filename);
          $target.find('input').val(imglist[key].filename);
        });
        const blob = imglist[key].blob;

        $('#list').append(`
          <tr data-href='${key}'>
            <td>
              <input class='imgchk' type='checkbox'>
            </td>
            <td>
              <a href='${key}' download=${imglist[key].filename}>
                <img src='${key}'/>
              </a>
            </td>
            <td>
              <input type='text' readonly value=${imglist[key].filename}>
            </td>
            <td>
              ${imglist[key].from}
            </td>
            <td>
              <span>${blob ? blob : '?'}</span>
            </td>
          </tr>`,
        );
      }
    }
  }
});*/
/*
*/


const Root = () => {
  const theme = createTheme();
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    </Provider>
  );
};

ReactDOM.render(<Root />, document.querySelector('#app'));

/*
import $ from 'jquery';
import {changeExt, hasExt, mime2ext} from './mime2ext';
import 'jszip';


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
