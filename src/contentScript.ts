import * as Message from './type';
import browser from 'webextension-polyfill';
import {v4 as uuidv4} from 'uuid';
import {str2bintxt} from './util/imgConverter';
import {classPrefix, overEx} from './type';

/*
const getSHA256Digest = async (msg:string) => {
  const uint8 = new TextEncoder().encode(msg);
  const digest = await crypto.subtle.digest('SHA-256', uint8);
  return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, '0')).join('');
};
*/
type ElementTree = {name: string, id:string, class: string[]};

type ElementInfo = {
  [keyof: string]: [ElementTree[], string, boolean];
};

const elementMemo:ElementInfo = {};

const UniqueClassRegex =
    new RegExp('\s?'+classPrefix+
        '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}',
    'gi');

const getUniqueElementSelector = (target: Element)=>{
  if (target.classList) {
    for (let i=0; i<target.classList.length; i++) {
      if (target.classList[i].indexOf(classPrefix)===0) {
        return `.${target.classList[i]}`;
      }
    }
  }
  const newUniqueClass = classPrefix + uuidv4();
  target.classList.add(newUniqueClass);
  return `.${newUniqueClass}`;
};

const getNodeTree = (target: Element): [boolean, ElementTree[]]=>{
  let x :Element | null = target;
  let isFixed: boolean = false;
  const domtree:ElementTree[] = [];
  while (x !== null) {
    const classlist = [];
    if (x.classList) {
      for (let i=0; i<x.classList.length; i++) {
        classlist.push(x.classList[i]);
      }
    }
    domtree.unshift({
      name: x.tagName.toLowerCase(),
      id: x.id,
      class: classlist,
    });
    if (window.getComputedStyle(x).position === 'fixed') isFixed = true;
    x = x.parentElement;
  }
  return [isFixed, domtree];
};

const tree2Info = (tree: ElementTree[]) =>
  tree.map((x)=>
    x.name +
    (x.class.length === 0 ? '' : '.'+x.class.join('.')) +
    (x.id === '' ? '' : '#'+x.id),
  ).join('>');

const getNodeTreeMemo =
  (target: Element, str: string): [string, string, boolean]=>{
    const selector = getUniqueElementSelector(target);
    if (!elementMemo[selector]) {
      const [isFixed, tree] = getNodeTree(target);
      elementMemo[selector] = [tree, tree2Info(tree), isFixed];
    }
    return [
      selector, elementMemo[selector][1]+`>${str}`, elementMemo[selector][2]];
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
      .flatMap((element): [string, string, string, boolean][] =>{
        const uri = element.getAttribute('src');
        return ( uri === null ?
          [] :
          [[uri, ...getNodeTreeMemo(element, 'img')]]
        );
      })
      .map(([uri, selector, treeinfo, isFixed]): [string, Message.PicObj] => {
        const [imgTrueUri, filename] = getimginfo(uri, location.href);
        return [imgTrueUri, {
          uri: imgTrueUri,
          locale: location.href,
          blob: null,
          filesize: null,
          filename: filename,
          selector,
          treeinfo,
          isFixed,
        }];
      });
  // css
  const csslist = Array.from(document.querySelectorAll('*'))
      .flatMap((element):[string, Element][]=>{
        const property = getComputedStyle(element).backgroundImage;
        return property ? [[property, element]] : [];
      })
      .flatMap(([property, element]):[string, string, string, boolean][]=>{
        const x =
          property.match(
              /((data|https?):)?\/\/[\w!\?/\+\-_~=;\.,\*&@#\$%\(\)'\[\]]+/g);
        return (x===null ?
            [] :
            x.map((uri)=>[uri, ...getNodeTreeMemo(element, 'css')]));
      })
      .map(([uri, selector, treeinfo, isFixed]): [string, Message.PicObj] => {
        const [imgTrueUri, filename] = getimginfo(uri, location.href);
        return [imgTrueUri, {
          uri: imgTrueUri,
          locale: location.href,
          blob: null,
          filesize: null,
          filename: filename,
          selector,
          treeinfo,
          isFixed,
        }];
      });
  // svg
  const svglist = Array.from(document.getElementsByTagName('svg'))
      .flatMap((svgElement): [string, string, string, boolean][] => {
        const expressedElmentCnt = Array.from(svgElement.children)
            .filter((x)=>x.tagName !== 'defs').length;
        const svgString = new XMLSerializer()
            .serializeToString(svgElement)
            .replace(UniqueClassRegex, '');
        return ( expressedElmentCnt === 0 ?
        [] :
        [[str2bintxt(svgString),
          ...getNodeTreeMemo(svgElement, 'svg')]]);
      })
      .map(
          ([base64, selector, treeinfo, isFixed]): [string, Message.PicObj] => {
            const [imgTrueUri, filename] =
              getimginfo(`data:image/svg+xml;base64,${base64}`, location.href);
            return [imgTrueUri, {
              uri: imgTrueUri,
              locale: location.href,
              blob: null,
              filesize: null,
              filename: filename,
              selector,
              treeinfo,
              isFixed,
            }];
          });
  // canvas
  const canvaslist = Array.from(document.getElementsByTagName('canvas'))
      .flatMap((canvasElement):[string, string, string, boolean][] =>{
        try {
          const dataURI = canvasElement.toDataURL();
          return dataURI ?
            [[dataURI, ...getNodeTreeMemo(canvasElement, 'canvas')]] :
            [];
        } catch (e) {
          // CROSS-ORIGIN ERROR
          return [];
        }
      })
      .map(
          ([base64URI,
            selector,
            treeinfo,
            isFixed]): [string, Message.PicObj] => {
            const [imgTrueUri, filename] =
              getimginfo(base64URI, location.href);
            return [imgTrueUri, {
              uri: imgTrueUri,
              locale: location.href,
              blob: null,
              filesize: null,
              filename: filename,
              selector,
              treeinfo,
              isFixed,
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


/* DOM SELECTOR */
const markElement = document.querySelector<HTMLDivElement>(`div.${overEx}`) ||
    (()=>{
      const newElement = document.createElement('div');
      newElement.classList.add(`div.${overEx}`);
      return newElement;
    })();
markElement.style.backgroundColor = 'rgba(175,223,228,0.5)';
markElement.style.borderStyle = 'dashed';
markElement.style.borderColor = '#0000FF';
markElement.style.boxSizing = 'border-box';
markElement.style.display = 'none';
markElement.style.zIndex = '8000';

const blinkAnimation = [
  {backgroundColor: 'rgba(175,223,228,0.3)', borderWidth: '0px'},
  {backgroundColor: 'rgba(175,223,228,0.8)', borderWidth: '2px'},
  {backgroundColor: 'rgba(175,223,228,0.3)', borderWidth: '0px'},
];

markElement.animate(blinkAnimation, {duration: 1000, iterations: Infinity});
document.body.appendChild(markElement);

const selectElement = (selector: string) =>{
  const target = document.querySelector(selector);
  if (!target) {
    // HIDE
    markElement.style.display = 'none';
    return;
  }
  const [, , isFixed] = elementMemo[selector];
  const {left, top} = target.getBoundingClientRect();
  if (target === null) return;
  markElement.style.top = `${(isFixed ? top : window.pageYOffset + top)}px`;
  markElement.style.left = `${(isFixed ? left : window.pageXOffset + left)}px`;
  markElement.style.width = `${target.clientWidth}px`;
  markElement.style.height = `${target.clientHeight}px`;
  markElement.style.display = 'block';
  markElement.style.position = isFixed ? 'fixed' : 'absolute';
  // TODO position-fixじゃなければ画像の中心が画面の真ん中に来るように
  if (!isFixed) {
    const pos = window.pageYOffset + top +
        target.clientHeight/2 - window.innerHeight/2;
    window.scrollTo({top: pos, behavior: 'smooth'});
  }
};

/* EVENT LISTENER & TRIGGER */
window.addEventListener('load', function() {
  sendImgList();
});

browser.runtime.onMessage.addListener((message: Message.Message) => {
  switch (message.command) {
    case 'requestImgList':
      sendImgList();
      break;
    case 'selectDOMElement':
      selectElement(message.selector);
      break;
    case 'removeSelector':
      selectElement('_');
      break;
  }
});

setInterval(()=>{
  sendImgList();
}, 3000);
