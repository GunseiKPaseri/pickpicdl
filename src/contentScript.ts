import * as Message from './message';

const getSHA256Digest = async (msg:string) => {
  const uint8 = new TextEncoder().encode(msg);
  const digest = await crypto.subtle.digest('SHA-256', uint8);
  return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, '0')).join('');
};


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
          blob: null,
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
              /(data|https?):\/\/[\w!\?/\+\-_~=;\.,\*&@#\$%\(\)'\[\]]+/g);
        return (x===null ? [] : x);
      })
      .map((uri): [string, Message.PicObj] => {
        const [imgTrueUri, filename] = getimginfo(uri, location.href);
        return [imgTrueUri, {
          blob: null,
          from: 'css',
          filename: filename,
        }];
      });
  // svg
  const svglist = Array.from(document.getElementsByTagName('svg'))
      .map((svgElement) => {
        return window.btoa(new XMLSerializer().serializeToString(svgElement));
      })
      .map((uri): [string, Message.PicObj] => {
        const [imgTrueUri, filename] = getimginfo(uri, location.href);
        return [imgTrueUri, {
          blob: null,
          from: 'css',
          filename: filename,
        }];
      });
  return [...imglist, ...csslist, ...svglist];
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
            console.warn(e);
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
  chrome.runtime.sendMessage(message, (res) =>{
    console.log(res);
  });
};

window.addEventListener('load', function() {
  sendImgList();
});

chrome.runtime.onMessage.addListener(function(message, sender, callback) {
  if (message.command === 'requestImgList') {
    sendImgList();
  }
});
