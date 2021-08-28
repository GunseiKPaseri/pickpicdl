import JSZip from 'jszip';
import {PicObjWithBlob} from '../type';

const restrictFileName = (name: string) =>
  name.replace(/[\\\/:*?"<>|]/g, (c) => '%' + c.charCodeAt(0).toString(16));

// [TODO] 入力ファイルが hoge, hoge(1)みたいなとき
export const generateZipBlob = (list: PicObjWithBlob[], name: string) => {
  const zip = new JSZip();
  const counter: {[keyof: string]: number} = {};
  list.forEach((list) => {
    if (list.blob!==null) {
      const filename = restrictFileName(list.filename);
      // 重複したファイル名の処理
      const cnt = (counter[filename] ?? 0) + 1;
      counter[filename] = cnt;
      const trueFilename = (cnt === 1 ?
        filename : filename.replace(/\.(.*?)$/, `(${cnt}).$1`));
      zip.file(trueFilename, list.blob);
    }
  });
  console.time('Zip Generation');
  return zip.generateAsync({type: 'blob'}).then((blob)=>{
    console.timeEnd('Zip Generation');
    return blob;
  });
};
