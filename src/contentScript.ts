const sendImgList = () => {
  console.log('読み込み終了');
  const imglist = [];

  const imgElemetns = document.getElementsByTagName('img');
  for (let i = 0; i< imgElemetns.length; i++) {
    const imgUri = imgElemetns[i].getAttribute('src');
    if (typeof imgUri === 'string' && imgUri !== '' )imglist.push(imgUri);
  }
  console.log(imglist);
  const message = {command: 'putimglist', imglist: imglist};
  // _port.postMessage(message);
  chrome.runtime.sendMessage(message, (res) =>{
    console.log(res);
  });
};

window.addEventListener('load', function() {
  sendImgList();
});
