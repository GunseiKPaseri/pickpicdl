import {PicObjWithBlob} from '../type';

const getfilename = (prop: string, x: PicObjWithBlob, i: number) => 
  prop
      // file index
      .replace(/%([0_\s]?)(\d+)d/g, (_, holder, spacelen) => {
        const len = parseInt(spacelen);
        return (Array(len).join(holder)+i).slice(-len);
      });

export const renamer =
  (prop: string, selectedItems: PicObjWithBlob[])
  : {uri:string, filename: string}[] => {
    return selectedItems.map((x: PicObjWithBlob, i) => {
      return {uri: x.uri, filename: getfilename(prop, x, i)};
    });
  };
