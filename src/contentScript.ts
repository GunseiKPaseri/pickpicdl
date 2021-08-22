import * as Message from './message';

const getimginfo = (imgUri: string, base: string )=>{
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
      .map((element)=>getComputedStyle(element).backgroundImage)
      .flatMap((property)=>{
        const x =
          property.match(/https?:\/\/[\w!\?/\+\-_~=;\.,\*&@#\$%\(\)'\[\]]+/g);
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
  return [...imglist, ...csslist];
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
            console.log(e);
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
