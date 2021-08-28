export type ImgResource = 'img' | 'css' | 'svg' | 'canvas';
type PicObjCommon = {uri: string, filename: string, from: ImgResource};
export type PicObjWithoutBlob = {blob: null, filesize: null} & PicObjCommon;
export type PicObjWithBlob = {blob: Blob, filesize: number} & PicObjCommon;
export type PicObj = PicObjWithBlob | PicObjWithoutBlob;

export type convertOption = 'default' | 'image/png';

export type MessageInit = {command: 'init', tabId: number};

export type MessageRequestImgList = {
  command: 'requestImgList',
  tabId: number,
};

export type MessagePicList = {
  command: 'putimglist',
  url: string,
  imglist: {[keyof: string]: PicObj}
};

export type Message = MessageInit | MessagePicList | MessageRequestImgList;

