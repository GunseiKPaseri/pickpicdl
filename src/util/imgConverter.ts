import {PicObjWithBlob} from '../type';
import {blobImg2imgelement, imgelement2blob} from './blobutil';
import {changeExt, mime2ext} from './mime2ext';

export const imgConverter =async (beforeObj: PicObjWithBlob, mime: string) => {
  // convert
  const ext = mime2ext(mime);
  if (beforeObj.blob.type === mime) return beforeObj;
  const image = await blobImg2imgelement(beforeObj.blob);
  const convertedBlob = await imgelement2blob(image, mime, 1);
  return {...beforeObj,
    filename: changeExt(beforeObj.filename, ext),
    blob: convertedBlob,
  };
};

export const str2bintxt = (str: string)=>{
  return window.btoa(unescape(encodeURI(str)));
};
