import $ from 'jquery';
import * as Message from './message';
import {changeExt, hasExt, mime2ext} from './mime2ext';
import 'jszip';
import JSZip from 'jszip';

console.clear();


const backgroundPageConnection = chrome.runtime.connect({
  name: 'picpickdl-devpage',
});

backgroundPageConnection.postMessage({
  command: 'init',
  tabId: chrome.devtools.inspectedWindow.tabId,
});


const imglink2Blob = (uri: string ) =>
  new Promise<Blob>((resolve, reject)=>{
    if (uri.indexOf('data:') === 0) {
      // base64
      const bintxt = window.atob(uri.replace(/^.*,/, ''));
      const mime = uri.match(/^.*:(.*);/)?.[1];
      const buffer = new Uint8Array(
          Array.from(bintxt).map((c)=>c.charCodeAt(0)),
      );
      resolve(new Blob([buffer], {type: mime}));
    } else {
      const xhr = new XMLHttpRequest();
      xhr.onload = function() {
        resolve(xhr.response as Blob);
      };
      xhr.open('GET', uri);
      xhr.responseType = 'blob';
      xhr.send();
    }
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

const blobImg2imgelement = (blob: Blob) =>
  new Promise<HTMLImageElement>((resolve, reject)=>{
    const blobURL = window.URL.createObjectURL(blob);
    const image = new Image();
    if (!image) reject(new Error('new Image()に失敗'));
    image.onload = () => {
      resolve(image);
    };
    image.src = blobURL;
  });

const imgelement2blob =
  (imgElement: HTMLImageElement, mimeType: string, qualityArgument?: number) =>
    new Promise<Blob>((resolve, reject)=>{
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.height = imgElement.height;
      canvas.width = imgElement.width;
      ctx?.drawImage(imgElement, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob)=>{
        if (blob===null) reject(new Error('Blobを作成できませんでした'));
        else resolve(blob);
      }, mimeType, qualityArgument);
    });


let uri = '';

let imglist: {[keyof: string]: Message.PicObj} = {};

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
});

const restrictFileName = (name: string) =>
  name.replace(/[\\\/:*?"<>|]/g, (c) => '%' + c.charCodeAt(0).toString(16));

const generateZipBlob = (list: Message.PicObj[], name: string) => {
  const zip = new JSZip();
  const counter: {[keyof: string]: number} = {};
  list.forEach((list) => {
    if (list.blob!==null) {
      const filename = restrictFileName(list.filename);
      // 重複したファイル名の処理
      const cnt = (counter[filename] ?? 0) + 1;
      counter[filename] = cnt;
      const trueFilename = (cnt === 1 ?
        filename : filename.replace(/\.(.*?)$/, `(${cnt}).$1`));
      zip.file(trueFilename, list.blob);
    }
  });
  return zip.generateAsync({type: 'blob'});
};


// img Download
$('#dlbutton').on('click', async ()=>{
  let target = $('.imgchk:checked').map(function() {
    // eslint-disable-next-line no-invalid-this
    return $(this).parent().parent().attr('data-href');
  }).get().map((x)=>imglist[x]).flatMap((x) => (x.blob === null ? [] : [x]));

  if (target.length === 0) {
    $('#dllink').attr('href', '#');
    $('#dllink').text(`選択しなさい`);
    return;
  }

  const mime = $('#imgconvert').val();
  if (typeof mime === 'string' && mime !== '') {
    // convert
    const ext = mime2ext(mime);
    target = await Promise.all(target.map(async (x) => {
      if (x.blob.type === mime) return x;
      const image = await blobImg2imgelement(x.blob);
      const blob = await imgelement2blob(image, mime, 1);
      return {...x, filename: changeExt(x.filename, ext), blob};
    }));
  }
  const zipBlob = await generateZipBlob(target, 'archive.zip');
  const zipBase64 = await blob2base64(zipBlob);
  $('#dllink').attr('href', zipBase64);
  $('#dllink').text(`ダウンロード(${(new Date()).toString()})`);
});


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
