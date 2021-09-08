import React from 'react';
import {CSSProperties} from 'react';
import {useSelector} from 'react-redux';
import {State} from '../redux';

const width = 500;
const height = 500;

const viewerStyleCommon: CSSProperties ={
  position: 'absolute',
  zIndex: 100,
  background: `
    linear-gradient(
      45deg, #9e9e9e 25%, transparent 25%, transparent 75%, #9e9e9e 75%),
    linear-gradient(
      45deg, #9e9e9e 25%, transparent 25%, transparent 75%, #9e9e9e 75%)
  `,
  backgroundSize: '16px 16px',
  backgroundPosition: '0 0, 8px 8px',
  backgroundColor: '#e0e0e0',
  objectFit: 'contain',
  opacity: 1,
  transition: '.1s',
};

export const ImgViewer = ():JSX.Element => {
  const hoveringItem = useSelector((state: State)=>state.hovering);
  if (hoveringItem===null) {
    return (
      <img style={{
        ...viewerStyleCommon,
        ...{
          opacity: 0,
          transition: '.1s',
        }}} />
    );
  }
  const viewerStyle: CSSProperties = {
    top: Math.min(
        Math.max(hoveringItem.top - height/2, 0),
        document.body.clientHeight - height),
    left: hoveringItem.left,
    width,
    height,
  };
  return (
    <img
      style={{...viewerStyleCommon, ...viewerStyle}}
      src={hoveringItem.src} />
  );
};
