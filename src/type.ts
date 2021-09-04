export type ImgResource = 'img' | 'css' | 'svg' | 'canvas';
type PicObjCommon = {
  uri: string,
  filename: string,
  treeinfo: string,
  selector: string,
  isFixed: boolean
};
export type PicObjWithoutBlob = {blob: null, filesize: null} & PicObjCommon;
export type PicObjWithBlob = {blob: Blob, filesize: number} & PicObjCommon;
export type PicObj = PicObjWithBlob | PicObjWithoutBlob;

export type convertOption = '' | 'image/png';

export type MessageInit = {command: 'init', tabId: number};

export type MessageRequestImgList = {
  command: 'requestImgList',
  tabId: number,
};

export type MessagePicList = {
  command: 'putimglist',
  url: string,
  imglist: {[keyof: string]: PicObj},
};

export type MessageSelectDOMElement = {
  command: 'selectDOMElement',
  selector: string,
  tabId: number,
}

export type MessageRemoveSelector = {
  command: 'removeSelector',
  tabId: number,
}


export const classPrefix = '💟';
export const overEx = `${classPrefix}884fc666-592d-4678-9f09-de0dd7a8d881`;

export type Message =
  | MessageInit
  | MessagePicList
  | MessageRequestImgList
  | MessageSelectDOMElement
  | MessageRemoveSelector;

export type HoveringItem = {
  src: string,
  left: number,
  top: number
}
