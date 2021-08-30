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
type ElementTree = {name: string, id:string, class: string[]};

const getNodeTree = (target: Element)=>{
  let x :Element | null = target;
  const domtree:ElementTree[] = [];
  while (x !== null) {
    const classlist = [];
    if (x.classList) {
      for (let i=0; i<x.classList.length; i++) {
        classlist.push(x.classList[i]);
      }
    }
    domtree.unshift({
      name: x.tagName,
      id: x.id,
      class: classlist,
    });
    x = x.parentElement;
  }
  return domtree;
};
const tree2Info = (tree: ElementTree[]) =>
  tree.map((x)=>
    x.name.toLowerCase() +
    (x.class.length === 0 ? '' : '.'+x.class.join('.')) +
    (x.id === '' ? '' : '#'+x.id),
  ).join('>');

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
      .flatMap((element): [string, ElementTree[]][] =>{
        const uri = element.getAttribute('src');
        return ( uri === null ? [] : [[uri, getNodeTree(element)]]);
      })
      .map(([uri, nodeTree]): [string, Message.PicObj] => {
        const [imgTrueUri, filename] = getimginfo(uri, location.href);
        return [imgTrueUri, {
          uri: imgTrueUri,
          blob: null,
          filesize: null,
          filename: filename,
          treeinfo: tree2Info(nodeTree)+'>img',
        }];
      });
  // css
  const csslist = Array.from(document.querySelectorAll('*'))
      .flatMap((element):[string, ElementTree[]][]=>{
        const property = getComputedStyle(element).backgroundImage;
        return property ? [[property, getNodeTree(element)]] : [];
      })
      .flatMap(([property, et]):[string, ElementTree[]][]=>{
        const x =
          property.match(
              /((data|https?):)?\/\/[\w!\?/\+\-_~=;\.,\*&@#\$%\(\)'\[\]]+/g);
        return (x===null ? [] : x.map((uri)=>[uri, et]));
      })
      .map(([uri, et]): [string, Message.PicObj] => {
        const [imgTrueUri, filename] = getimginfo(uri, location.href);
        return [imgTrueUri, {
          uri: imgTrueUri,
          blob: null,
          filesize: null,
          filename: filename,
          treeinfo: tree2Info(et)+'>css',
        }];
      });
  // svg
  const svglist = Array.from(document.getElementsByTagName('svg'))
      .flatMap((svgElement): [string, ElementTree[]][] => {
        const expressedElmentCnt = Array.from(svgElement.children)
            .filter((x)=>x.tagName !== 'defs').length;
        return ( expressedElmentCnt === 0 ?
        [] :
        [[window.btoa(new XMLSerializer().serializeToString(svgElement)),
          getNodeTree(svgElement)]]);
      })
      .map(([base64, et]): [string, Message.PicObj] => {
        const [imgTrueUri, filename] =
          getimginfo(`data:image/svg+xml;base64,${base64}`, location.href);
        return [imgTrueUri, {
          uri: imgTrueUri,
          blob: null,
          filesize: null,
          filename: filename,
          treeinfo: tree2Info(et)+'>svg',
        }];
      });
  // canvas
  const canvaslist = Array.from(document.getElementsByTagName('canvas'))
      .flatMap((canvasElement):[string, ElementTree[]][] =>{
        try {
          const dataURI = canvasElement.toDataURL();
          return dataURI ? [[dataURI, getNodeTree(canvasElement)]] : [];
        } catch (e) {
          // CROSS-ORIGIN ERROR
          return [];
        }
      })
      .map(([base64URI, et]): [string, Message.PicObj] => {
        const [imgTrueUri, filename] =
          getimginfo(base64URI, location.href);
        return [imgTrueUri, {
          uri: imgTrueUri,
          blob: null,
          filesize: null,
          filename: filename,
          treeinfo: tree2Info(et)+'>canvas',
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
