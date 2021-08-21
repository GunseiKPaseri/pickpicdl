export type PicObj = {dataURL: string | null, filename: string};

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

