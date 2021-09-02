import React from 'react';
import {CSSProperties} from 'react';
import {useSelector} from 'react-redux';
import {State} from '../redux';

const width = 200;
const height = 200;

export const ImgViewer = ():JSX.Element => {
  const hoveringItem = useSelector((state: State)=>state.hovering);
  if (hoveringItem===null) return (<></>);
  const viewerStyle: CSSProperties = {
    position: 'absolute',
    top: hoveringItem.top - height/2,
    left: hoveringItem.left,
    zIndex: 100,
    width,
    height,
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
  };
  return (
    <img style={viewerStyle} src={hoveringItem.src} />
  );
};
