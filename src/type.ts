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

export type Message =
  | MessageInit
  | MessagePicList
  | MessageRequestImgList
  | MessageSelectDOMElement;

