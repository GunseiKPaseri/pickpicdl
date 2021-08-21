import * as Message from './message';

const sendImgList = () => {
  const imglist: {[keyof: string]: Message.PicObj} = {};

  const imgElemetns = document.getElementsByTagName('img');
  for (let i = 0; i< imgElemetns.length; i++) {
    const imgUri = imgElemetns[i].getAttribute('src');
    if (imgUri === null) continue;

    const imgTrueUri:string = (new URL(imgUri, location.href)).toString();
    const filename =
      imgTrueUri.match(/.+\/(.+?)([\?#;].*)?$/)?.[1] || 'anyfile';

    imglist[imgTrueUri] = {
      dataURL: null,
      filename: filename,
    };
  }
  const message: Message.MessagePicList = {
    command: 'putimglist',
    url: location.href,
    imglist: imglist,
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
