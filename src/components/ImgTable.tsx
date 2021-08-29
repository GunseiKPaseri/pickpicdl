import MaterialTable, {Column} from 'material-table';
import React from 'react';
import {lighten} from '@material-ui/core/styles/colorManipulator';
import {useTheme} from '@material-ui/core';
import {useDispatch, useSelector} from 'react-redux';
import {getSetSelectedItemAction, State} from '../redux';
import {PicObjWithBlob} from '../type';


const ImgTable = ():JSX.Element => {
  const theme = useTheme();
  // Redux State
  const list = useSelector<State, PicObjWithBlob[]>((state) =>
    Object.keys(state.items).map((key)=>state.items[key]));
  const [columnObject] = React.useState<Column<PicObjWithBlob>[]>([
    {
      title: '画像',
      render: (rowData) =>
        <img src={rowData.uri} style={{maxWidth: 50, maxHeight: 50}} />,
      editable: 'never',
    },
    {
      title: 'URI',
      field: 'uri',
      render: (rowData)=><input type='url' value={rowData.uri} readOnly />,
      editable: 'never',
    },
    {
      title: 'ファイル名',
      field: 'filename',
      render: (rowData)=>rowData.filename.slice(-15),
    },
    {title: 'リソース', field: 'from', editable: 'never'},
  ]);
  const dispatch = useDispatch();
  return (
    <MaterialTable options={{
      filtering: true,
      selection: true,
      showTitle: false,
      rowStyle: (rowData) => ({
        backgroundColor:
            rowData.tableData.checked ?
            lighten(theme.palette.secondary.light, 0.85) : '',
      }),
    }}
    onSelectionChange={(data) => dispatch(getSetSelectedItemAction(data))}
    columns={columnObject}
    data={list} />
  );
};
export default ImgTable;
