import browser from 'webextension-polyfill';

export const imglink2Blob = (uri: string ) =>
  new Promise<Blob>((resolve, reject)=>{
    if (uri.indexOf('data:') === 0) {
      // base64
      const bintxt = window.atob(uri.replace(/^.*,/, ''));
      const mime = uri.match(/^.*:(.*);/)?.[1];
      const buffer = new Uint8Array(
          Array.from(bintxt).map((c)=>c.charCodeAt(0)),
      );
      resolve(new Blob([buffer], {type: mime}));
    } else {
      const xhr = new XMLHttpRequest();
      xhr.onload = function() {
        resolve(xhr.response as Blob);
      };
      xhr.open('GET', uri);
      xhr.responseType = 'blob';
      xhr.send();
    }
  });

export const blob2base64 = (blob: Blob) =>
  new Promise<string>((resolve, reject)=>{
    const fileReader = new FileReader();
    fileReader.onload = function() {
      if (this.result === null) {
        reject(new Error(
            browser.i18n.getMessage('cantBlob2Base64'),
        ));
      }
      resolve(this.result as string);
    };
    fileReader.readAsDataURL(blob);
  });

export const blobImg2imgelement = (blob: Blob) =>
  new Promise<HTMLImageElement>((resolve, reject)=>{
    const blobURL = window.URL.createObjectURL(blob);
    const image = new Image();
    if (!image) reject(new Error('new Image()に失敗'));
    image.onload = () => {
      resolve(image);
    };
    image.src = blobURL;
  });

export const imgelement2blob =
(imgElement: HTMLImageElement, mimeType: string, qualityArgument?: number) =>
  new Promise<Blob>((resolve, reject)=>{
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.height = imgElement.height;
    canvas.width = imgElement.width;
    ctx?.drawImage(imgElement, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob)=>{
      if (blob===null) {
        reject(new Error(
            browser.i18n.getMessage('cantMakeBlob'),
        ));
      } else resolve(blob);
    }, mimeType, qualityArgument);
  });
