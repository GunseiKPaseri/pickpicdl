import * as Message from './type';
import browser from 'webextension-polyfill';

/*
const getSHA256Digest = async (msg:string) => {
  const uint8 = new TextEncoder().encode(msg);
  const digest = await crypto.subtle.digest('SHA-256', uint8);
  return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, '0')).join('');
};
*/

const getimginfo = (imgUri: string, base: string )=>{
  if (imgUri.indexOf('data:') == 0) {
    return [imgUri, 'data-uri'];
  }
  const imgTrueUri:string = (new URL(imgUri, base)).toString();
  const filename =
    imgTrueUri.match(/.+\/(.+?)([\?#;].*)?$/)?.[1] || 'anyfile';
  return [imgTrueUri, filename];
};

const getImgList = (document: Document) =>{
  // img
  const imglist = Array.from(document.getElementsByTagName('img'))
      .flatMap((element) =>{
        const uri = element.getAttribute('src');
        return ( uri === null ? [] : [uri]);
      })
      .map((uri): [string, Message.PicObj] => {
        const [imgTrueUri, filename] = getimginfo(uri, location.href);
        return [imgTrueUri, {
          uri: imgTrueUri,
          blob: null,
          filesize: null,
          from: 'img',
          filename: filename,
        }];
      });
  // css
  const csslist = Array.from(document.querySelectorAll('*'))
      .flatMap((element)=>getComputedStyle(element).backgroundImage)
      .flatMap((property)=>{
        const x =
          property.match(
              /((data|https?):)?\/\/[\w!\?/\+\-_~=;\.,\*&@#\$%\(\)'\[\]]+/g);
        return (x===null ? [] : x);
      })
      .map((uri): [string, Message.PicObj] => {
        const [imgTrueUri, filename] = getimginfo(uri, location.href);
        return [imgTrueUri, {
          uri: imgTrueUri,
          blob: null,
          filesize: null,
          from: 'css',
          filename: filename,
        }];
      });
  // svg
  const svglist = Array.from(document.getElementsByTagName('svg'))
      .flatMap((svgElement) => {
        const expressedElmentCnt = Array.from(svgElement.children)
            .filter((x)=>x.tagName !== 'defs').length;
        return ( expressedElmentCnt === 0 ?
        [] : [window.btoa(new XMLSerializer().serializeToString(svgElement))]);
      })
      .map((base64): [string, Message.PicObj] => {
        const [imgTrueUri, filename] =
          getimginfo(`data:image/svg+xml;base64,${base64}`, location.href);
        return [imgTrueUri, {
          uri: imgTrueUri,
          blob: null,
          filesize: null,
          from: 'svg',
          filename: filename,
        }];
      });
  // canvas
  const canvaslist = Array.from(document.getElementsByTagName('canvas'))
      .flatMap((canvasElement) =>{
        try {
          const dataURI = canvasElement.toDataURL();
          return dataURI ? [dataURI] : [];
        } catch (e) {
          // CROSS-ORIGIN ERROR
          return [];
        }
      })
      .map((base64URI): [string, Message.PicObj] => {
        const [imgTrueUri, filename] =
          getimginfo(base64URI, location.href);
        return [imgTrueUri, {
          uri: imgTrueUri,
          blob: null,
          filesize: null,
          from: 'canvas',
          filename: filename,
        }];
      });
  return [...imglist, ...csslist, ...svglist, ...canvaslist];
};


const sendImgList = () => {
  const imglistEntry = [
    // main
    ...getImgList(document),
    // iframe
    ...Array.from(document.getElementsByTagName('iframe'))
        .flatMap((iframeElement) => {
          const win = iframeElement.contentWindow;
          try {
            return (win === null ? [] : [win.document]);
          } catch (e) {
            // CROSS-ORIGIN ERROR
            return [];
          }
        })
        .flatMap((document) => getImgList(document)),
  ];

  const message: Message.MessagePicList = {
    command: 'putimglist',
    url: location.href,
    imglist: Object.fromEntries(imglistEntry),
  };
  // _port.postMessage(message);
  browser.runtime.sendMessage(message).then((res) =>{
    console.log(res);
  });
};

window.addEventListener('load', function() {
  sendImgList();
});

browser.runtime.onMessage.addListener((message) => {
  if (message.command === 'requestImgList') {
    sendImgList();
  }
});

setInterval(()=>{
  sendImgList();
}, 3000);
