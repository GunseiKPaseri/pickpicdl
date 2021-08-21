export type PicObj = string;

export type MessageInit = {'command': 'init', tabId: number};

export type MessagePicList = {'command': 'putimglist', 'imglist': [string]};

export type Message = MessageInit | MessagePicList;

