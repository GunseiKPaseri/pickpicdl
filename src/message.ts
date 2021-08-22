type PicObjCommon = {filename: string, from: 'img' | 'css' | 'svg' | 'canvas'};
export type PicObjWithBlob = {blob: null} & PicObjCommon;
export type PicObjWithoutBlob = {blob: Blob} & PicObjCommon;
export type PicObj = PicObjWithBlob | PicObjWithoutBlob;

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

