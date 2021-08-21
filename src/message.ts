export type PicObjWithBlob = {blob: null, filename: string};
export type PicObjWithoutBlob = {blob: Blob, filename: string};
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

