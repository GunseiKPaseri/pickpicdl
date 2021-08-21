const extMap: {[keyof: string]: string} = {
  'image/apng': '.apng',
  'image/avif': '.avif',
  'image/gif': '.gif',
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/svg+xml': '.svg',
  'image/webp': '.webp',
  'image/bmp': '.bmp',
  'image/tiff': '.tiff',
};

export const mime2ext = (mime: string):string => extMap[mime];

export const hasExt = (filename: string, ext: string) =>
  filename.lastIndexOf(ext) !== filename.length - ext.length;

export const changeExt = (filename: string, ext: string) => {
  if (filename.indexOf('.')===-1) return filename+ext;
  return (filename.slice(0, filename.lastIndexOf('.'))as string)+ext;
};
