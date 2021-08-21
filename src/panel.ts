import $ from 'jquery';
import * as Message from './message';
import {mime2ext} from './mime2ext';
import 'jszip';
import JSZip from 'jszip';

console.clear();
console.log('test');


const backgroundPageConnection = chrome.runtime.connect({
  name: 'picpickdl-devpage',
});

backgroundPageConnection.postMessage({
  command: 'init',
  tabId: chrome.devtools.inspectedWindow.tabId,
});


const imglink2Blob = (url: string ) =>
  new Promise<[Blob, string | null]>((resolve, reject)=>{
    const xhr = new XMLHttpRequest();
    xhr.onload = function() {
      resolve([
        xhr.response as Blob,
        xhr.getResponseHeader('content-type'),
      ]);
    };
    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.send();
  });

const blob2base64 = (blob: Blob) =>
  new Promise<string>((resolve, reject)=>{
    const fileReader = new FileReader();
    fileReader.onload = function() {
      if (this.result === null) reject(new Error('can\'t blob2base64'));
      resolve(this.result as string);
    };
    fileReader.readAsDataURL(blob);
  });


let uri = '';

let imglist: {[keyof: string]: Message.PicObj} = {};

backgroundPageConnection.onMessage.addListener((message: Message.Message)=>{
  if (message.command === 'putimglist') {
    if (uri !== message.url) {
      imglist = {};
      $('#list').html(`
        <tr>
          <th></th><th>画像</th><th>タイトル</th><th>getdata?</th>
        </tr>`);
      uri = message.url;
    }
    for (const key in message.imglist) {
      if (!(key in imglist)) {
        // newof
        imglist[key] = message.imglist[key];
        // getDataURL
        imglink2Blob(key).then(([blob, type])=>{
          imglist[key].blob = blob;
          const $target = $(`tr[data-href="${key}"]`);
          $target.find('span').text('○');
          const ext = type ? mime2ext(type) : null;
          if (!ext) {
            // bad file
            delete imglist[key];
            $target.remove();
            return;
          }
          if (ext && imglist[key].filename.lastIndexOf(ext) !==
              imglist[key].filename.length - ext.length ) {
            imglist[key].filename += ext;
          }
          $target.find('a').attr('download', imglist[key].filename);
          $target.find('input').val(imglist[key].filename);
        });
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
              <span>${(imglist[key].blob !== null ? '○' : '×')}</span>
            </td>
          </tr>`,
        );
      }
    }
  }
});

const restrictFileName = (name: string) =>
  name.replace(/[\\\/:*?"<>|]/g, (c) => '%' + c.charCodeAt(0).toString(16));

const generateZipBlob = (list: Message.PicObj[], name: string) => {
  const zip = new JSZip();
  console.log(list);
  list.forEach((list) => {
    if (list.blob!==null) {
      zip.file(restrictFileName(list.filename), list.blob);
    }
  });
  return zip.generateAsync({type: 'blob'});
};

$('#dlbutton').on('click', async ()=>{
  const target = $('.imgchk:checked').map(function() {
    return $(this).parent().parent().attr('data-href');
  }).get().map((x)=>imglist[x]);

  if (target.length === 0) {
    $('#dllink').attr('href', '#');
    $('#dllink').text(`選択しなさい`);
    return;
  }
  const zipBlob = await generateZipBlob(target, 'archive.zip');
  const zipBase64 = await blob2base64(zipBlob);
  $('#dllink').attr('href', zipBase64);
  $('#dllink').text(`ダウンロード(${(new Date()).toString()})`);
})


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
